// Builds design tokens from docs/design.md frontmatter (source of truth).
// Run: node tools/build-design-tokens.mjs
// Outputs: docs/design-tokens.json (W3C DTCG), docs/design-tokens.css (CSS custom properties),
//          and refreshes the :root block between token markers inside docs/design.html.
import fs from 'node:fs';

const docs = new URL('../docs/', import.meta.url);
const md = fs.readFileSync(new URL('design.md', docs), 'utf8');
const fm = md.match(/^---\n([\s\S]*?)\n---/)[1];

// --- minimal YAML (maps + scalars + trailing comments) ---------------------
function parse(src) {
  const root = {}, stack = [{ indent: -1, node: root }], comments = new Map();
  for (const raw of src.split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const m = raw.match(/\s+#(?=[^"]*$)\s*(.*)$/);              // trailing comment (not inside quotes)
    const line = m ? raw.slice(0, m.index) : raw;
    const indent = line.match(/^ */)[0].length;
    const kv = line.trim().match(/^("?)([^":]+)\1:\s*(.*)$/);
    if (!kv) throw new Error('Cannot parse: ' + raw);
    const [, , key, rawVal] = kv;
    while (stack.at(-1).indent >= indent) stack.pop();
    const parent = stack.at(-1).node;
    if (rawVal === '') { parent[key] = {}; stack.push({ indent, node: parent[key] }); }
    else {
      let v = rawVal.trim();
      if (/^".*"$/.test(v)) v = v.slice(1, -1);
      else if (/^-?\d+(\.\d+)?$/.test(v)) v = Number(v);
      parent[key] = v;
    }
    if (m) comments.set(parent, { ...(comments.get(parent) || {}), [key]: m[1] });
  }
  return { root, comments };
}
const { root: t, comments } = parse(fm);
const note = (obj, k) => comments.get(obj)?.[k];

// --- DTCG JSON -------------------------------------------------------------
const groupMap = { colors: 'color', typography: 'typography', rounded: 'radius', spacing: 'spacing' };
const ref = v => typeof v === 'string'
  ? v.replace(/\{(colors|typography|rounded|spacing)\.([^}]+)\}/g, (_, g, k) => `{${groupMap[g]}.${k}}`) : v;
const tok = (type, value, description) => ({ $type: type, $value: value, ...(description ? { $description: description } : {}) });

const out = {
  $description: `${t.name} — ${t.description}`,
  $extensions: { source: t.source, generatedFrom: 'docs/design.md', generator: 'tools/build-design-tokens.mjs' },
  color: {}, typography: {}, radius: {}, spacing: {}, shadow: {}, component: {},
};
for (const [k, v] of Object.entries(t.colors)) out.color[k] = tok('color', v, note(t.colors, k));
for (const [k, v] of Object.entries(t.typography)) out.typography[k] = tok('typography', {
  fontFamily: v.fontFamily, fontSize: v.fontSize, fontWeight: v.fontWeight,
  lineHeight: v.lineHeight, letterSpacing: v.letterSpacing ?? '0em',
});
for (const [k, v] of Object.entries(t.rounded)) out.radius[k] = tok('dimension', v, note(t.rounded, k));
for (const [k, v] of Object.entries(t.spacing)) out.spacing[k] = tok('dimension', v);
out.shadow.focus = tok('shadow', { offsetX: '0px', offsetY: '0px', blur: '0px', spread: '3px', color: '{color.focus}' },
  'Focus ring — the only box-shadow in the system.');
const propType = { backgroundColor: 'color', textColor: 'color', borderColor: 'color', typography: 'typography', rounded: 'dimension',
  height: 'dimension', width: 'dimension', size: 'dimension' };
for (const [c, props] of Object.entries(t.components)) {
  out.component[c] = {};
  for (const [p, v] of Object.entries(props)) {
    out.component[c][p] = propType[p] && v !== 'transparent' ? tok(propType[p], ref(v)) : { $value: ref(v) };
  }
}
fs.writeFileSync(new URL('design-tokens.json', docs), JSON.stringify(out, null, 2) + '\n');

// --- CSS custom properties -------------------------------------------------
const L = [];
for (const [k, v] of Object.entries(t.colors)) L.push(`  --color-${k}: ${v};`);
L.push('');
L.push(`  --font-sans: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, system-ui, sans-serif;`);
for (const [k, v] of Object.entries(t.typography)) {
  L.push(`  --type-${k}-size: ${v.fontSize}; --type-${k}-weight: ${v.fontWeight}; --type-${k}-lh: ${v.lineHeight}; --type-${k}-ls: ${v.letterSpacing ?? '0em'};`);
}
L.push('');
for (const [k, v] of Object.entries(t.rounded)) L.push(`  --radius-${k}: ${v};`);
L.push('');
for (const [k, v] of Object.entries(t.spacing)) L.push(`  --space-${k}: ${v};`);
L.push('');
L.push(`  --shadow-focus: 0 0 0 3px var(--color-focus);`);
// Responsive aliases: desktop/mobile pairs collapse into one name.
const pairs = [...new Set(Object.keys(t.typography).filter(k => k.endsWith('-desktop')).map(k => k.replace(/-desktop$/, '')))];
const alias = bp => pairs.map(p => ['size', 'weight', 'lh', 'ls'].map(x => `--type-${p}-${x}: var(--type-${p}-${bp}-${x});`).join(' ')).map(s => '  ' + s);
const rootBlock = `:root {\n${L.join('\n')}\n\n  /* responsive aliases (desktop ≥ 768px) */\n${alias('desktop').join('\n')}\n}\n` +
  `@media (max-width: 767px) {\n  :root {\n${alias('mobile').map(s => '  ' + s).join('\n')}\n  }\n}`;
const typeClasses = [...pairs, ...Object.keys(t.typography).filter(k => !/-(desktop|mobile)$/.test(k))]
  .map(k => `.t-${k} { font-family: var(--font-sans); font-size: var(--type-${k}-size); font-weight: var(--type-${k}-weight); line-height: var(--type-${k}-lh); letter-spacing: var(--type-${k}-ls); }`);
const css = `/* ${t.name} design tokens — generated from docs/design.md by tools/build-design-tokens.mjs. Do not edit by hand. */\n` +
  `@import url("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap");\n\n` +
  rootBlock + '\n\n/* type utilities (responsive where a desktop/mobile pair exists) */\n' + typeClasses.join('\n') + '\n';
fs.writeFileSync(new URL('design-tokens.css', docs), css);

// --- inject into design.html ----------------------------------------------
const htmlUrl = new URL('design.html', docs);
if (fs.existsSync(htmlUrl)) {
  const html = fs.readFileSync(htmlUrl, 'utf8');
  const next = html.replace(/\/\* tokens:start \*\/[\s\S]*?\/\* tokens:end \*\//,
    `/* tokens:start */\n${rootBlock}\n${typeClasses.join('\n')}\n/* tokens:end */`);
  fs.writeFileSync(htmlUrl, next);
}
const n = o => Object.keys(o).length;
console.log(`colors ${n(t.colors)} · type ${n(t.typography)} · radius ${n(t.rounded)} · spacing ${n(t.spacing)} · components ${n(t.components)}`);
