#!/usr/bin/env node
/**
 * Beautify an HTML file whose elements carry huge inline `style` attributes
 * (e.g. a DevTools "copy outerHTML" snapshot with computed styles inlined).
 *
 * js-beautify's HTML formatter only indents the markup; it cannot break up a
 * single 10 KB `style="..."` attribute. This script therefore:
 *   1. swaps every inline style value for a short placeholder,
 *   2. formats the markup with html_beautify(),
 *   3. formats each style value with css_beautify() (one declaration per line)
 *      and puts it back, indented inside the tag.
 *
 * The CSS step is verified: if css_beautify does not preserve the declaration
 * list exactly, the script falls back to splitting on top-level semicolons.
 *
 * Usage:
 *   node tools/beautify-html.mjs <input.html> [--out <file>] [--indent <n>] [--no-backup]
 */

import fs from "node:fs";
import path from "node:path";
import beautifyPkg from "js-beautify";

const { html_beautify, css_beautify } = beautifyPkg;

const TAG_RE = /<[a-zA-Z][^>]*>/g;
const STYLE_RE = /(\s)style="([^"]*)"/;

/* ------------------------------------------------------------------ utils */

function decodeEntities(value) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function encodeEntities(value) {
  return value
    .replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Split a declaration list on `;` that is not inside quotes or parentheses. */
function splitDeclarations(css) {
  const declarations = [];
  let current = "";
  let quote = null;
  let depth = 0;

  for (const char of css) {
    if (quote) {
      current += char;
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      current += char;
      continue;
    }
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);
    if (char === ";" && depth === 0) {
      const declaration = current.trim();
      if (declaration) declarations.push(`${declaration};`);
      current = "";
      continue;
    }
    current += char;
  }

  const tail = current.trim();
  if (tail) declarations.push(tail.endsWith(";") ? tail : `${tail};`);
  return declarations;
}

const normalize = (declarations) =>
  declarations.map((d) => d.replace(/\s+/g, " ").trim());

function sameDeclarations(a, b) {
  const left = normalize(a);
  const right = normalize(b);
  return left.length === right.length && left.every((d, i) => d === right[i]);
}

/* ------------------------------------------------ inline style formatting */

function formatStyleValue(rawValue) {
  const css = decodeEntities(rawValue);
  const original = splitDeclarations(css);
  if (original.length === 0) return { declarations: [], usedFallback: false };

  let declarations = original;
  let usedFallback = false;

  try {
    // Wrap in a dummy rule so css_beautify parses a real declaration block.
    const formatted = css_beautify(`.x{${css}}`, {
      indent_size: 2,
      end_with_newline: false,
      newline_between_rules: false,
      selector_separator_newline: false,
      space_around_combinator: false,
    });
    const body = formatted.slice(formatted.indexOf("{") + 1, formatted.lastIndexOf("}"));
    const parsed = splitDeclarations(body);
    if (sameDeclarations(original, parsed)) {
      declarations = parsed;
    } else {
      usedFallback = true;
    }
  } catch {
    usedFallback = true;
  }

  return { declarations, usedFallback };
}

/* ------------------------------------------------------------ main pipeline */

function beautify(source, { indentSize = 2 } = {}) {
  const styleValues = [];

  // 1. Replace every inline style value with a short placeholder.
  const templated = source.replace(TAG_RE, (tag) =>
    tag.replace(STYLE_RE, (match, whitespace, value) => {
      const index = styleValues.push(value) - 1;
      return `${whitespace}style="__STYLE_BLOCK_${index}__"`;
    }),
  );

  // 2. Format the markup.
  const markup = html_beautify(templated, {
    indent_size: indentSize,
    wrap_line_length: 0,
    wrap_attributes: "auto",
    indent_inner_html: false,
    preserve_newlines: false,
    extra_liners: [],
  });

  // 3. Put the formatted CSS back, indented inside each tag.
  let fallbacks = 0;
  const output = markup.replace(/style="__STYLE_BLOCK_(\d+)__"/g, (match, id, offset, whole) => {
    const { declarations, usedFallback } = formatStyleValue(styleValues[Number(id)]);
    if (usedFallback) fallbacks += 1;
    if (declarations.length === 0) return `style=""`;

    const lineStart = whole.lastIndexOf("\n", offset) + 1;
    const baseIndent = whole.slice(lineStart, offset).match(/^[ \t]*/)[0];
    const declarationIndent = baseIndent + " ".repeat(indentSize * 2);
    const closingIndent = baseIndent + " ".repeat(indentSize);

    const lines = declarations.map(
      (declaration) => declarationIndent + encodeEntities(declaration),
    );
    return `style="\n${lines.join("\n")}\n${closingIndent}"`;
  });

  return { output, styleCount: styleValues.length, fallbacks };
}

/* ---------------------------------------------------------------- CLI glue */

function parseArgs(argv) {
  const args = { input: null, out: null, indentSize: 2, backup: true };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out" || arg === "-o") args.out = argv[++i];
    else if (arg === "--indent" || arg === "-s") args.indentSize = Number(argv[++i]);
    else if (arg === "--no-backup") args.backup = false;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!arg.startsWith("-")) args.input = arg;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || !args.input) {
    console.log(`Usage: node tools/beautify-html.mjs <input.html> [options]

Options:
  -o, --out <file>   write here (default: format the input file in place)
  -s, --indent <n>   indent width (default: 2)
      --no-backup    do not keep a <name>.original.html copy
  -h, --help         show this help`);
    process.exit(args.help ? 0 : 1);
  }

  const input = path.resolve(args.input);
  const out = args.out ? path.resolve(args.out) : input;
  const source = fs.readFileSync(input, "utf8");

  const { output, styleCount, fallbacks } = beautify(source, {
    indentSize: args.indentSize,
  });

  if (args.backup && out === input) {
    const backup = input.replace(/(\.[^./\\]+)$/, ".original$1");
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, source);
    console.log(`backup: ${path.relative(process.cwd(), backup)}`);
  }

  fs.writeFileSync(out, output);

  console.log(`beautified ${path.relative(process.cwd(), input)} -> ${path.relative(process.cwd(), out)}`);
  console.log(`  inline styles formatted: ${styleCount}`);
  if (fallbacks) console.log(`  css_beautify fallbacks: ${fallbacks}`);
  console.log(`  bytes: ${source.length} -> ${output.length}`);
}

main();
