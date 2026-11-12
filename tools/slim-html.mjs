#!/usr/bin/env node
/**
 * Slim a "computed-style snapshot" HTML file: the kind of markup you get from
 * DevTools' "Copy outerHTML" after the browser has inlined every computed
 * property on every element.
 *
 * Such a file renders fine but is unreadable and enormous. This script:
 *
 *   1. extracts base64 `data:` images to real files and rewrites `src`,
 *   2. drops properties that cannot affect the rendering of this page
 *      (animation/timeline/scroll/anchor/math/ruby metadata, -webkit-* aliases,
 *      unused custom properties, SVG paint props outside SVG, ...),
 *   3. drops declarations that are already inherited from an ancestor,
 *   4. hoists what is left into deduplicated classes in one <style> block,
 *   5. formats the markup with js-beautify.
 *
 * Cascade order is preserved: declarations are emitted in their original order,
 * duplicates keep the last value, and a declaration is never dropped when an
 * earlier shorthand in the same element could set it.
 *
 * Usage:
 *   node tools/slim-html.mjs <input.html> [--out <file>] [--images <dir>]
 *                            [--indent <n>] [--keep-custom-props] [--keep-inline]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import beautifyPkg from "js-beautify";

const { html_beautify } = beautifyPkg;

/* --------------------------------------------------------------- constants */

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "param", "source", "track", "wbr",
]);

// Non-visual or non-applicable here: safe to remove regardless of value.
// Matched as the bare name or as a "name-" prefix.
const NOISE_BASES = [
  "-webkit-", "math", "ruby", "anchor", "animation", "transition",
  "view-transition", "view-timeline", "scroll-timeline", "timeline",
  "trigger", "position-try", "column-rule", "row-rule", "rule", "contain",
  "container", "corner", "offset", "mask", "scroll", "overscroll",
  "scrollbar", "interest", "text-emphasis", "text-box", "text-decoration",
  "text-underline", "outline", "font-variant", "font-synthesis",
  "font-feature", "font-variation", "font-palette", "font-optical",
  "font-kerning", "font-language", "font-size-adjust", "border-image",
  "border-shape", "break", "counter", "background-blend",
];

const NOISE_PROPS = new Set([
  "speak", "marker", "paint-order", "color-interpolation",
  "color-interpolation-filters", "color-rendering", "shape-rendering",
  "image-rendering", "text-rendering", "buffered-rendering",
  "dynamic-range-limit", "app-region", "window-drag", "interactivity",
  "position-anchor", "position-area", "position-visibility", "hyphens",
  "hyphenate-character", "hyphenate-limit-chars", "line-break", "text-autospace",
  "text-spacing-trim", "text-combine-upright", "text-orientation",
  "text-size-adjust", "text-justify", "text-align-last", "initial-letter",
  "text-fit", "widows", "orphans", "tab-size", "quotes", "pointer-events",
  "user-select", "resize", "touch-action", "caret-color", "caret-animation",
  "caret-shape", "accent-color", "appearance", "field-sizing", "isolation",
  "mix-blend-mode", "filter", "backdrop-filter", "will-change",
  "interpolate-size", "transform-style", "backface-visibility", "perspective",
  "perspective-origin", "transform-box", "transform-origin", "rotate", "scale",
  "translate", "zoom", "clip", "clip-path", "clip-rule", "shape-outside",
  "shape-margin", "shape-image-threshold", "object-view-box", "image-orientation",
  "vector-effect", "box-decoration-break", "overflow-anchor",
  "overflow-clip-margin", "table-layout", "border-collapse", "border-spacing",
  "caption-side", "empty-cells", "margin-trim", "reading-flow", "reading-order",
  "overlay", "content-visibility", "unicode-bidi", "corner-shape",
  "column-count", "column-fill", "column-height", "column-span", "column-width",
  "column-wrap", "columns", "frame-sizing", "forced-color-adjust",
  "print-color-adjust",
]);

// Only meaningful on SVG; dropped everywhere else.
const SVG_PROPS = new Set([
  "fill", "fill-opacity", "fill-rule", "stroke", "stroke-width",
  "stroke-dasharray", "stroke-dashoffset", "stroke-linecap", "stroke-linejoin",
  "stroke-miterlimit", "stroke-opacity", "stop-color", "stop-opacity",
  "flood-color", "flood-opacity", "lighting-color", "text-anchor",
  "dominant-baseline", "alignment-baseline", "baseline-shift",
  "baseline-source", "cx", "cy", "d", "r", "rx", "ry", "x", "y",
]);

// Dropped when the computed value equals the property's initial value.
// Only non-inherited properties belong here (inherited ones are handled by
// comparing with the inherited value, which is stricter and always correct).
const DROP_IF_DEFAULT = {
  opacity: "1",
  "z-index": "auto",
  transform: "none",
  "box-shadow": "none",
  float: "none",
  clear: "none",
  content: "normal",
  "aspect-ratio": "auto",
  "object-fit": "fill",
  "object-position": "50% 50%",
  overflow: "visible",
  "vertical-align": "baseline",
  "background-image": "none",
  "text-overflow": "clip",
  position: "static",
  top: "auto",
  right: "auto",
  bottom: "auto",
  left: "auto",
  // SVG defaults
  "fill-opacity": "1",
  "fill-rule": "nonzero",
  "stroke-width": "1px",
  "stroke-dasharray": "none",
  "stroke-dashoffset": "0px",
  "stroke-linecap": "butt",
  "stroke-linejoin": "miter",
  "stroke-miterlimit": "4",
  "stroke-opacity": "1",
  "text-anchor": "start",
  "dominant-baseline": "auto",
  "alignment-baseline": "auto",
  // Flex / grid / alignment defaults
  order: "0",
  "flex-grow": "0",
  "flex-shrink": "1",
  "flex-basis": "auto",
  "flex-direction": "row",
  "flex-wrap": "nowrap",
  "align-content": "normal",
  "align-items": "normal",
  "align-self": "auto",
  "justify-content": "normal",
  "justify-items": "legacy",
  "justify-self": "auto",
  "row-gap": "normal",
  "column-gap": "normal",
  grid: "none",
  "grid-area": "auto",
  "grid-template-areas": "none",
  "grid-template-columns": "none",
  "grid-template-rows": "none",
  "grid-auto-columns": "auto",
  "grid-auto-rows": "auto",
  "grid-auto-flow": "row",
  "grid-column-start": "auto",
  "grid-column-end": "auto",
  "grid-row-start": "auto",
  "grid-row-end": "auto",
  // Background defaults
  "background-position": "0% 0%",
  "background-size": "auto",
  "background-repeat": "repeat",
  "background-origin": "padding-box",
  "background-clip": "border-box",
  "background-attachment": "scroll",
  "background-color": "rgba(0, 0, 0, 0)",
  // Box defaults
  "max-width": "none",
  "max-height": "none",
  "min-height": "auto",
  "min-width": "auto",
  "border-style": "none",
  "border-top-style": "none",
  "border-right-style": "none",
  "border-bottom-style": "none",
  "border-left-style": "none",
  "border-radius": "0px",
  "list-style": "outside none disc",
};

// Inherited properties: removable when an ancestor already computes the value.
const INHERITED = new Set([
  "color", "font-family", "font-size", "font-weight", "font-style",
  "font-stretch", "line-height", "letter-spacing", "word-spacing",
  "text-indent", "text-align", "text-transform", "text-shadow", "direction",
  "writing-mode", "white-space", "white-space-collapse", "word-break",
  "overflow-wrap", "text-wrap", "text-wrap-mode", "text-wrap-style",
  "list-style", "list-style-type", "list-style-position", "list-style-image",
  "cursor", "visibility", "quotes", "orphans", "widows", "tab-size", "hyphens",
  "line-break", "border-collapse", "border-spacing", "caption-side",
  "empty-cells", "-webkit-text-fill-color", "color-scheme",
]);

// Initial values used when comparing against the document (no parent).
const INITIAL = {
  color: "rgb(0, 0, 0)",
  "font-size": "16px",
  "font-weight": "400",
  "font-style": "normal",
  "line-height": "normal",
  "letter-spacing": "normal",
  "word-spacing": "0px",
  "text-indent": "0px",
  "text-align": "start",
  "text-transform": "none",
  "text-shadow": "none",
  direction: "ltr",
  "writing-mode": "horizontal-tb",
  "white-space": "normal",
  "white-space-collapse": "collapse",
  "word-break": "normal",
  "overflow-wrap": "normal",
  "text-wrap": "wrap",
  "text-wrap-mode": "wrap",
  "text-wrap-style": "auto",
  "list-style-type": "disc",
  "list-style-position": "outside",
  "list-style-image": "none",
  cursor: "auto",
  visibility: "visible",
  quotes: "auto",
  orphans: "2",
  widows: "2",
  "tab-size": "8",
  hyphens: "manual",
  "line-break": "auto",
  "border-collapse": "separate",
  "border-spacing": "0px",
  "caption-side": "top",
  "empty-cells": "show",
  "-webkit-text-fill-color": "currentcolor",
  "color-scheme": "normal",
};

// Longhands set by each shorthand, so a redundant longhand is never dropped
// when an earlier shorthand in the same rule would apply instead.
const SHORTHAND_LONGHANDS = {
  font: ["font-family", "font-size", "font-style", "font-weight", "font-stretch", "line-height", "font-kerning", "font-feature-settings", "font-variation-settings", "font-optical-sizing", "font-size-adjust", "font-language-override"],
  "list-style": ["list-style-type", "list-style-position", "list-style-image"],
  "text-wrap": ["text-wrap-mode", "text-wrap-style"],
  "white-space": ["white-space-collapse", "text-wrap-mode"],
  "text-decoration": ["text-decoration-line", "text-decoration-style", "text-decoration-color", "text-decoration-thickness"],
  background: ["background-color", "background-image", "background-position", "background-size", "background-repeat", "background-origin", "background-clip", "background-attachment"],
  border: ["border-width", "border-style", "border-color"],
  "border-radius": ["border-top-left-radius", "border-top-right-radius", "border-bottom-right-radius", "border-bottom-left-radius"],
  inset: ["top", "right", "bottom", "left"],
  margin: ["margin-top", "margin-right", "margin-bottom", "margin-left"],
  padding: ["padding-top", "padding-right", "padding-bottom", "padding-left"],
  gap: ["row-gap", "column-gap"],
  flex: ["flex-grow", "flex-shrink", "flex-basis"],
  "flex-flow": ["flex-direction", "flex-wrap"],
  overflow: ["overflow-x", "overflow-y"],
  "place-items": ["align-items", "justify-items"],
  "place-content": ["align-content", "justify-content"],
  "place-self": ["align-self", "justify-self"],
  grid: ["grid-template-rows", "grid-template-columns", "grid-template-areas", "grid-auto-rows", "grid-auto-columns", "grid-auto-flow"],
  "grid-area": ["grid-row-start", "grid-column-start", "grid-row-end", "grid-column-end"],
  "text-emphasis": ["text-emphasis-style", "text-emphasis-color"],
  transition: ["transition-property", "transition-duration", "transition-timing-function", "transition-delay"],
  animation: ["animation-name", "animation-duration", "animation-timing-function", "animation-delay", "animation-iteration-count", "animation-direction", "animation-fill-mode", "animation-play-state"],
  mask: ["mask-image", "mask-mode", "mask-repeat", "mask-position", "mask-clip", "mask-origin", "mask-size", "mask-composite"],
};

/* ------------------------------------------------------------------- utils */

function splitDeclarations(css) {
  const out = [];
  let cur = "";
  let quote = null;
  let depth = 0;
  for (const ch of css) {
    if (quote) {
      cur += ch;
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      cur += ch;
      continue;
    }
    if (ch === "(") depth += 1;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) {
      const d = cur.trim();
      if (d) out.push(d);
      cur = "";
      continue;
    }
    cur += ch;
  }
  const tail = cur.trim();
  if (tail) out.push(tail);
  return out;
}

function decodeEntities(value) {
  return value.replace(/&(?:quot|apos|#39|lt|gt|amp);/g, (entity) =>
    ({ "&quot;": '"', "&apos;": "'", "&#39;": "'", "&lt;": "<", "&gt;": ">", "&amp;": "&" })[entity],
  );
}

function encodeEntities(value) {
  return value
    .replace(/&(?![a-zA-Z#0-9]+;)/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseStyleAttr(rawValue) {
  const decls = [];
  for (const raw of splitDeclarations(decodeEntities(rawValue))) {
    const idx = raw.indexOf(":");
    if (idx < 0) continue;
    const prop = raw.slice(0, idx).trim();
    const val = raw.slice(idx + 1).trim().replace(/\s+/g, " ");
    if (prop) decls.push({ prop, value: val });
  }
  return decls;
}

/* ------------------------------------------------------------------ parsing */

const TAG_RE = /<[^>]*>|[^<]+/g;

function parseAttrs(source) {
  const attrs = [];
  const re = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
  let m;
  while ((m = re.exec(source))) {
    const name = m[1];
    const value = m[2] ?? m[3] ?? "";
    if (name === "/") continue;
    attrs.push({ name, value });
  }
  return attrs;
}

function parseFragment(src) {
  const root = { tag: "#root", attrs: [], children: [], parent: null };
  const stack = [root];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(src))) {
    const token = m[0];
    if (token.startsWith("</")) {
      const tag = token.slice(2, -1).trim();
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].tag === tag) {
          stack.length = i;
          break;
        }
      }
    } else if (token.startsWith("<")) {
      const selfClosing = token.endsWith("/>");
      const inner = token.slice(1, selfClosing ? -2 : -1);
      const spaceIdx = inner.search(/\s/);
      const tag = (spaceIdx < 0 ? inner : inner.slice(0, spaceIdx)).trim();
      const attrs = spaceIdx < 0 ? [] : parseAttrs(inner.slice(spaceIdx));
      const el = { tag, attrs, children: [], parent: stack[stack.length - 1] };
      stack[stack.length - 1].children.push(el);
      if (!selfClosing && !VOID_TAGS.has(tag)) stack.push(el);
    } else {
      stack[stack.length - 1].children.push({ text: token, parent: stack[stack.length - 1] });
    }
  }
  return root;
}

function walk(node, fn, insideSvg = false) {
  for (const child of node.children ?? []) {
    if (child.text !== undefined) {
      fn(child, insideSvg);
      continue;
    }
    fn(child, insideSvg);
    walk(child, fn, insideSvg || child.tag === "svg");
  }
}

/* --------------------------------------------------------------- processing */

function getStyleDecls(el) {
  const attr = el.attrs.find((a) => a.name === "style");
  return attr ? parseStyleAttr(attr.value) : [];
}

function declMap(el) {
  const map = new Map();
  for (const { prop, value } of getStyleDecls(el)) map.set(prop, value);
  return map;
}

function isNoise(prop) {
  if (NOISE_PROPS.has(prop)) return true;
  if (prop.startsWith("-webkit-")) return true;
  return NOISE_BASES.some((base) => prop === base || prop.startsWith(`${base}-`));
}

// UA stylesheets give these elements non-zero margins/paddings, so a computed
// "0px" there is meaningful and must not be dropped.
const UA_MARGIN_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "dl", "dd",
  "dt", "blockquote", "pre", "figure", "hr", "fieldset", "form", "body",
  "table", "address", "menu", "dir", "legend", "caption",
]);
const UA_PADDING_TAGS = new Set([
  "ul", "ol", "dl", "dd", "fieldset", "form", "body", "td", "th",
  "caption", "menu", "dir", "table", "pre",
]);
const MARGIN_RE = /^margin(-(top|right|bottom|left))?$/;
const PADDING_RE = /^padding(-(top|right|bottom|left))?$/;

const UA_DECORATION_TAGS = new Set([
  "a", "u", "ins", "s", "strike", "del", "abbr", "acronym",
]);

const isDecorationProp = (prop) =>
  prop.startsWith("text-decoration") || prop.startsWith("text-underline");

/**
 * Properties the user-agent stylesheet sets for a given tag. Dropping such a
 * declaration does not fall back to the inherited value but to the UA rule
 * (linked text gets underlined and a pointer cursor, `small` gets a smaller
 * font, table headers get a bold centred font, ...), so they must be kept.
 */
function uaSetsProperty(tag, prop) {
  switch (tag) {
    case "a":
      return prop === "color" || prop === "cursor" || isDecorationProp(prop);
    case "abbr":
    case "acronym":
    case "u":
    case "ins":
    case "s":
    case "strike":
    case "del":
      return isDecorationProp(prop);
    case "mark":
      return prop === "background-color" || prop === "color";
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
      return (
        prop.startsWith("margin") ||
        prop === "font-size" ||
        prop === "font-weight"
      );
    case "p":
    case "blockquote":
    case "dl":
    case "dd":
    case "pre":
    case "address":
    case "figure":
    case "hr":
    case "fieldset":
    case "legend":
    case "menu":
    case "dir":
      return prop.startsWith("margin");
    case "ul":
    case "ol":
      return (
        prop.startsWith("margin") ||
        prop.startsWith("padding") ||
        prop.startsWith("list-style") ||
        prop === "display"
      );
    case "li":
      return prop === "display" || prop.startsWith("list-style");
    case "b":
    case "strong":
    case "th":
      return (
        prop === "font-weight" ||
        prop === "text-align" ||
        prop === "vertical-align"
      );
    case "i":
    case "em":
    case "cite":
    case "dfn":
    case "var":
      return prop === "font-style";
    case "small":
    case "big":
      return prop === "font-size";
    case "sub":
    case "sup":
      return prop === "font-size" || prop === "vertical-align";
    case "code":
    case "kbd":
    case "samp":
    case "tt":
      return prop === "font-family" || prop === "font-size";
    case "td":
      return (
        prop === "text-align" ||
        prop === "vertical-align" ||
        prop.startsWith("padding")
      );
    case "caption":
      return prop === "text-align";
    case "table":
      return prop === "border-collapse" || prop === "font-weight";
    case "q":
      return prop === "quotes";
    default:
      return false;
  }
}

function inheritedValue(el, prop) {
  for (let node = el.parent; node && node.tag !== "#root"; node = node.parent) {
    const map = node.__declMap || (node.__declMap = declMap(node));
    if (map.has(prop)) return map.get(prop);
  }
  return INITIAL[prop];
}

function shouldDrop(prop, value, el, insideSvg, covered, options, ctx) {
  // Custom properties: only kept on request (they are unused after computing).
  if (prop.startsWith("--")) return !options.keepCustomProps;

  // Never drop a declaration that overrides a UA rule; dropping it would let
  // the UA value through (e.g. links regain underlines and a pointer cursor).
  if (uaSetsProperty(el.tag, prop)) return false;

  // The only -webkit-* properties that paint anything here.
  if (prop === "-webkit-text-fill-color") return value === "currentcolor";
  if (prop.startsWith("-webkit-text-stroke")) return true;

  // Decorations are only droppable when nothing is decorated anyway.
  if (isDecorationProp(prop)) return !ctx.decoration;

  // `tabular-nums` and friends change glyph widths: keep non-default variants.
  if (prop.startsWith("font-variant")) return value === "normal";

  // Not painted, but part of the snapshot's behaviour: keep non-default values.
  if (prop === "user-select" || prop === "pointer-events") return value === "auto";

  if (isNoise(prop)) return true;
  if (SVG_PROPS.has(prop) && !insideSvg) return true;
  if (covered.has(prop)) return false;

  const defaultValue = DROP_IF_DEFAULT[prop];
  if (defaultValue !== undefined && value === defaultValue) return true;

  // Zero margins/paddings are only redundant on elements the UA leaves alone.
  if (value === "0px" && MARGIN_RE.test(prop) && !UA_MARGIN_TAGS.has(el.tag)) return true;
  if (value === "0px" && PADDING_RE.test(prop) && !UA_PADDING_TAGS.has(el.tag)) return true;

  if (INHERITED.has(prop)) {
    const inherited = inheritedValue(el, prop);
    if (inherited !== undefined && inherited === value) return true;
  }
  return false;
}

function pruneElement(el, insideSvg, options) {
  const decls = getStyleDecls(el);
  if (decls.length === 0) return [];

  const map = new Map();
  for (const { prop, value } of decls) map.set(prop, value);

  const covered = new Set();
  const kept = [];
  const indexByProp = new Map();

  const decoration =
    UA_DECORATION_TAGS.has(el.tag) ||
    (map.get("text-decoration-line") ?? "none") !== "none" ||
    (map.get("-webkit-text-decorations-in-effect") ?? "none") !== "none";
  const ctx = { decoration };

  for (const { prop, value } of decls) {
    if (shouldDrop(prop, value, el, insideSvg, covered, options, ctx)) continue;
    if (indexByProp.has(prop)) kept[indexByProp.get(prop)] = null;
    indexByProp.set(prop, kept.length);
    kept.push(`${prop}: ${value};`);
    const longhands = SHORTHAND_LONGHANDS[prop];
    if (longhands) for (const lh of longhands) covered.add(lh);
  }

  return kept.filter(Boolean);
}

const EXT_BY_MIME = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "image/avif": "avif",
};

function extractImages(root, imagesDir, options) {
  const written = [];
  const cache = new Map();
  walk(root, (el) => {
    if (el.text !== undefined) return;
    const src = el.attrs.find((a) => a.name === "src");
    if (!src || !src.value.startsWith("data:")) return;
    const match = /^data:([^;,]+)(;base64)?,(.*)$/s.exec(src.value);
    if (!match) return;
    const [, mime, base64, payload] = match;
    const ext = EXT_BY_MIME[mime] ?? "bin";
    const buffer = base64
      ? Buffer.from(payload, "base64")
      : Buffer.from(decodeURIComponent(payload), "utf8");
    const hash = crypto.createHash("sha256").update(buffer).digest("hex").slice(0, 10);
    const fileName = `${hash}.${ext}`;

    if (!cache.has(fileName)) {
      fs.mkdirSync(imagesDir, { recursive: true });
      fs.writeFileSync(path.join(imagesDir, fileName), buffer);
      cache.set(fileName, buffer.length);
      written.push({ fileName, bytes: buffer.length });
    }
    src.value = options.imageSrcPrefix
      ? `${options.imageSrcPrefix}${fileName}`
      : `${path.basename(imagesDir)}/${fileName}`;
    options.imageCounter += 1;
  });
  return written;
}

function serialize(node, classFor, inlineFor) {
  let out = "";
  for (const child of node.children ?? []) {
    if (child.text !== undefined) {
      out += child.text;
      continue;
    }
    const attrs = child.attrs
      .map((a) => {
        if (a.name === "style") {
          const cls = classFor.get(child);
          if (cls) return `class="${cls}"`;
          const inlineDecls = inlineFor?.get(child);
          if (inlineDecls && inlineDecls.length) {
            return `style="${encodeEntities(inlineDecls.join(" "))}"`;
          }
          return null;
        }
        return `${a.name}="${a.value}"`;
      })
      .filter(Boolean);
    out += `<${child.tag}${attrs.length ? " " + attrs.join(" ") : ""}>`;
    if (!VOID_TAGS.has(child.tag)) {
      out += serialize(child, classFor, inlineFor);
      out += `</${child.tag}>`;
    }
  }
  return out;
}

/* ---------------------------------------------------------------- pipeline */

function slim(source, options) {
  const root = parseFragment(source);

  const images = options.extractImages
    ? extractImages(root, options.imagesDir, options)
    : [];

  // Pass 1: prune every element's declarations.
  const keptByElement = new Map();
  const stats = { before: 0, after: 0 };
  walk(root, (el, insideSvg) => {
    if (el.text !== undefined) return;
    stats.before += getStyleDecls(el).length;
    const kept = pruneElement(el, insideSvg, options);
    stats.after += kept.length;
    keptByElement.set(el, kept);
    el.__declMap = declMap(el);
  });

  // Pass 2: group identical declaration lists into classes.
  const classFor = new Map();
  const inlineFor = new Map();
  const classDecls = [];
  const classIndex = new Map();
  walk(root, (el) => {
    if (el.text !== undefined) return;
    const kept = keptByElement.get(el);
    if (!kept || kept.length === 0) return;
    if (options.keepInline) {
      inlineFor.set(el, kept);
      return;
    }
    const key = kept.join("\n");
    let name = classIndex.get(key);
    if (!name) {
      name = `c${classIndex.size + 1}`;
      classIndex.set(key, name);
      classDecls.push({ name, decls: kept });
    }
    classFor.set(el, name);
  });

  let markup = serialize(root, classFor, inlineFor);
  markup = html_beautify(markup, {
    indent_size: options.indentSize,
    wrap_line_length: 100,
    wrap_attributes: "auto",
    indent_inner_html: false,
    preserve_newlines: false,
    extra_liners: [],
  });

  const styleBlock = options.keepInline
    ? ""
    : [
        "<style>",
        "  /* Computed styles from the source snapshot, deduplicated into classes. */",
        ...classDecls.flatMap(({ name, decls }) => [
          `  .${name} {`,
          ...decls.map((d) => `    ${d}`),
          "  }",
        ]),
        "</style>",
        "",
      ].join("\n");

  const output = `${styleBlock}${markup}`;

  return { output, images, stats, classes: classDecls.length, decls: stats.after };
}

/* ---------------------------------------------------------------- CLI glue */

function parseArgs(argv) {
  const args = {
    input: null,
    out: null,
    imagesDir: null,
    indentSize: 2,
    keepCustomProps: false,
    keepInline: false,
    skipImages: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out" || arg === "-o") args.out = argv[++i];
    else if (arg === "--images") args.imagesDir = argv[++i];
    else if (arg === "--indent" || arg === "-s") args.indentSize = Number(argv[++i]);
    else if (arg === "--keep-custom-props") args.keepCustomProps = true;
    else if (arg === "--keep-inline") args.keepInline = true;
    else if (arg === "--no-images") args.skipImages = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (!arg.startsWith("-")) args.input = arg;
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    console.log(`Usage: node tools/slim-html.mjs <input.html> [options]

Options:
  -o, --out <file>     write here (default: overwrite the input)
      --images <dir>   directory for extracted images (default: <out dir>/images)
      --no-images      leave data: URIs untouched
  -s, --indent <n>     indent width (default: 2)
      --keep-inline    keep pruned styles inline instead of hoisting to classes
      --keep-custom-props
                       keep --custom-property declarations
  -h, --help           show this help`);
    process.exit(args.help ? 0 : 1);
  }

  const input = path.resolve(args.input);
  const out = args.out ? path.resolve(args.out) : input;
  const imagesDir = path.resolve(args.imagesDir ?? path.join(path.dirname(out), "images"));
  const source = fs.readFileSync(input, "utf8");

  // Keep a copy of the untouched input when rewriting in place.
  if (out === input) {
    const backup = input.replace(/(\.[^./\\]+)$/, ".source$1");
    if (!fs.existsSync(backup)) fs.writeFileSync(backup, source);
  }

  const { output, images, stats, classes } = slim(source, {
    indentSize: args.indentSize,
    keepCustomProps: args.keepCustomProps,
    keepInline: args.keepInline,
    extractImages: !args.skipImages,
    imagesDir,
    imageCounter: 0,
  });

  fs.writeFileSync(out, output);

  const rel = (p) => path.relative(process.cwd(), p);
  console.log(`slimmed ${rel(input)} -> ${rel(out)}`);
  console.log(`  declarations: ${stats.before} -> ${stats.after} (${classes} classes)`);
  if (images.length) {
    console.log(`  images: ${images.length} files, ${(images.reduce((s, i) => s + i.bytes, 0) / 1024).toFixed(0)} KB -> ${rel(imagesDir)}/`);
  }
  console.log(`  bytes: ${source.length} -> ${output.length} (${(100 * output.length / source.length).toFixed(0)}%)`);
}

main();
