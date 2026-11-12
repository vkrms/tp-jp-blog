#!/usr/bin/env node
// Статический предпросмотр статьи из content/articles.json (не прототип): node tools/preview-article.mjs <slug> [--before=path.json]
// Если есть out/edits/<slug>.before.json, абзацы, которых там не было, подсвечиваются. Результат: out/preview/<slug>.html
import fs from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const slug = process.argv[2];
const articles = JSON.parse(read('content/articles.json'));
const a = articles.find((x) => x.slug === slug);
if (!a) throw new Error(`no article ${slug}`);
const beforePath = `out/edits/${slug}.before.json`;
const before = fs.existsSync(new URL(beforePath, ROOT)) ? JSON.parse(read(beforePath)) : null;
const oldSet = new Set(before ? before.sections.flatMap((s) => s.b).map((b) => JSON.stringify(b)) : []);
const isNew = (b) => before && !oldSet.has(JSON.stringify(b));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// пара [ja,en] -> два span; переключатель языка скрывает один из них
const t = (x) => { const [ja, en] = Array.isArray(x) ? x : [x.ja, x.en]; return `<span lang="ja">${md(ja)}</span><span lang="en">${md(en)}</span>`; };
const md = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const block = (b) => { const h = blockHtml(b); return isNew(b) && !b.p ? `<div class="newblk">${h}</div>` : h; };
const blockHtml = (b) => {
  if (b.p) return `<p class="${isNew(b) ? 'new' : ''}">${t(b.p)}</p>`;
  if (b.h3) return `<h3>${t(b.h3)}</h3>`;
  if (b.img) return `<figure><img src="../../content/${b.img.src}" alt="${esc(b.img.alt[0])}" loading="lazy"><figcaption>${t(b.img.caption)}</figcaption></figure>`;
  if (b.table) {
    const head = b.table.head.map((h) => `<th>${t(h)}</th>`).join('');
    const rows = b.table.rows.map((r) => `<tr>${r.map((c) => `<td>${t(c)}</td>`).join('')}</tr>`).join('');
    return `<div class="tw"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (b.point) return `<aside class="point"><b>${t(b.point[0])}</b><div>${t(b.point[1])}</div></aside>`;
  if (b.steps) return `<ol class="steps">${b.steps.map((s) => `<li>${t(s)}</li>`).join('')}</ol>`;
  if (b.list) return `<ul>${b.list.map((s) => `<li>${t(s)}</li>`).join('')}</ul>`;
  if (b.diff) return `<div class="diff"><div class="was">${t(b.diff[0])}</div><div class="now">${t(b.diff[1])}</div></div>`;
  return `<pre>${esc(JSON.stringify(b))}</pre>`;
};

const added = before ? a.sections.flatMap((s) => s.b).filter(isNew).length : 0;
const html = `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(a.title.ja)}</title>
<link rel="stylesheet" href="../../docs/design-tokens.css">
<style>
  body{margin:0;background:var(--color-surface-muted);font-family:var(--font-sans);color:var(--color-body);line-height:1.9;font-size:16px}
  .bar{position:sticky;top:0;z-index:5;background:#fff;border-bottom:1px solid var(--color-line);padding:10px 24px;display:flex;gap:12px;align-items:center;justify-content:space-between;font-size:14px}
  .bar button{font:inherit;border:1px solid var(--color-line-strong);background:#fff;border-radius:8px;padding:6px 14px;cursor:pointer}
  .bar button[aria-pressed=true]{background:var(--color-primary);color:#fff;border-color:var(--color-primary)}
  .legend{display:flex;align-items:center;gap:8px;color:var(--color-secondary)}
  .legend i{display:inline-block;width:14px;height:14px;border-radius:3px;background:var(--color-primary-100);border:1px solid var(--color-primary-200)}
  main{max-width:760px;margin:32px auto;background:#fff;border:1px solid var(--color-line);border-radius:16px;padding:48px 56px}
  small.eb{color:var(--color-primary-pressed);font-weight:700;letter-spacing:.04em}
  h1{font-size:30px;line-height:1.4;color:var(--color-ink);margin:8px 0 20px}
  h2{font-size:22px;line-height:1.5;color:var(--color-ink);margin:44px 0 12px;padding-top:8px;border-top:1px solid var(--color-line)}
  .ans{background:var(--color-primary-50);border-left:4px solid var(--color-primary);padding:14px 18px;border-radius:8px;margin:0 0 8px}
  p{margin:14px 0}
  h3{font-size:18px;line-height:1.5;color:var(--color-ink);margin:30px 0 6px}
  figure{margin:22px 0}figure img{width:100%;border-radius:12px;display:block}figcaption{font-size:13px;color:var(--color-muted);margin-top:6px}
  .newblk{background:var(--color-primary-50);outline:2px solid var(--color-primary-100);outline-offset:6px;border-radius:6px}
  p.new{background:var(--color-primary-100);border-left:3px solid var(--color-primary);padding:8px 14px;border-radius:6px}
  .tw{overflow-x:auto;margin:18px 0}
  table{border-collapse:collapse;width:100%;font-size:14px;line-height:1.6}
  th,td{border:1px solid var(--color-line);padding:9px 12px;text-align:left;vertical-align:top}
  th{background:var(--color-surface-soft);color:var(--color-label)}
  .point{background:var(--color-warm-50);border-left:4px solid var(--color-warm);padding:12px 16px;border-radius:8px;margin:18px 0}
  .point b{display:block;color:var(--color-warm-strong)}
  .steps{padding-left:22px}.steps li{margin:6px 0}
  ul{padding-left:22px}li{margin:4px 0}
  .diff{display:grid;gap:8px;margin:18px 0}.diff div{padding:10px 14px;border-radius:8px;font-size:14px}
  .was{background:var(--color-surface-soft);color:var(--color-secondary)}.now{background:#ECFDF3;border:1px solid #ABEFC6}
  .faq{margin-top:12px}.faq div{border:1px solid var(--color-line);border-radius:10px;padding:12px 16px;margin:10px 0;background:var(--color-surface-muted)}
  .faq b{display:block;color:var(--color-ink)}
  .matome{background:var(--color-surface-soft);border-radius:12px;padding:8px 22px}
  body[data-lang=ja] [lang=en],body[data-lang=en] [lang=ja]{display:none}
</style></head>
<body data-lang="ja">
<div class="bar"><div class="legend"><i></i> ${before ? `${added} new blocks (highlighted)` : 'preview'} · <code>${slug}</code> · updated ${a.updated_at}</div>
<div><button id="ja" aria-pressed="true">日本語</button> <button id="en" aria-pressed="false">English</button></div></div>
<main>
  <small class="eb">${t(a.eyebrow)}</small>
  <h1>${t(a.title)}</h1>
  <div class="ans">${t(a.answer_first)}</div>
  ${a.sections.map((s) => `<h2>${t(s.h)}</h2>${s.b.map(block).join('\n')}`).join('\n')}
  <h2><span lang="ja">よくある質問</span><span lang="en">FAQ</span></h2>
  <div class="faq">${a.faq.map((f) => `<div><b>${t(f[0])}</b>${t(f[1])}</div>`).join('')}</div>
  <h2><span lang="ja">まとめ</span><span lang="en">Summary</span></h2>
  <ul class="matome">${a.matome.map((m) => `<li>${t(m)}</li>`).join('')}</ul>
</main>
<script>
  const set = (l) => { document.body.dataset.lang = l; document.documentElement.lang = l; document.getElementById('ja').setAttribute('aria-pressed', l === 'ja'); document.getElementById('en').setAttribute('aria-pressed', l === 'en'); };
  document.getElementById('ja').onclick = () => set('ja'); document.getElementById('en').onclick = () => set('en');
</script>
</body></html>`;
fs.mkdirSync(new URL('out/preview/', ROOT), { recursive: true });
fs.writeFileSync(new URL(`out/preview/${slug}.html`, ROOT), html);
console.log(`out/preview/${slug}.html (${added} new blocks highlighted)`);
