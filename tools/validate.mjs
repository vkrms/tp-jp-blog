// Валидатор контента. Запуск: node tools/validate.mjs   (exit code 1, если есть ошибки)
import fs from 'node:fs';
import { validateFigure } from './lib/figures.mjs';
const read = p => JSON.parse(fs.readFileSync(new URL('../content/' + p, import.meta.url), 'utf8'));
const articles = read('articles.json');
const { sources } = read('sources.json');
const rules = read('rules.json');
const figureManifest = JSON.parse(fs.readFileSync(new URL('../tools/figures/templates.json', import.meta.url), 'utf8'));
const BLOCK_KEYS = new Set(['p', 'h3', 'img', 'figure', 'table', 'steps', 'list', 'say', 'point', 'warn', 'diff']);
const srcIds = new Set(sources.map(s => s.id));
const errors = [], warns = [];
const text = a => JSON.stringify([a.title, a.answer_first, a.sections, a.faq, a.matome]);
for (const a of articles) {
  const e = m => errors.push(`${a.slug}: ${m}`), w = m => warns.push(`${a.slug}: ${m}`);
  for (const f of rules.required_fields) if (a[f] == null || (Array.isArray(a[f]) && !a[f].length && f !== 'sources')) e(`нет поля ${f}`);
  // Блоки (docs/spec-stage1.md §3.2): один ключ, известный тип; фигуры — по реестру шаблонов (docs/figures.md).
  const dataFigures = [];
  for (const s of a.sections || []) for (const b of s.b || []) {
    const keys = Object.keys(b || {});
    if (keys.length !== 1) { e(`блок должен иметь один ключ, а их ${keys.length}${keys.length ? ` (${keys.join(', ')})` : ''}`); continue; }
    if (!BLOCK_KEYS.has(keys[0])) e(`неизвестный тип блока «${keys[0]}»`);
    if (b.figure) {
      for (const m of validateFigure(b.figure, figureManifest)) e(m);
      if (!(figureManifest.raster_kinds || []).includes(b.figure.kind)) dataFigures.push(b.figure);
    }
  }
  if (dataFigures.length) {
    const structured = (a.sections || []).some(s => (s.b || []).some(b => b.table || b.steps || b.list));
    if (!structured) w('есть data-фигура, но в статье нет ни таблицы, ни шагов, ни списка: данные живут только в картинке');
  }
  for (const s of a.sources || []) if (!srcIds.has(s)) e(`источник ${s} не в реестре`);
  if ((a.faq || []).length < rules.faq_min || (a.faq || []).length > rules.faq_max) w(`FAQ: ${(a.faq || []).length} (нужно ${rules.faq_min}-${rules.faq_max})`);
  if (a.answer_first?.ja && a.answer_first.ja.replace(/\*\*/g, '').length > rules.answer_first_max_chars_ja) w(`ответ в начале длиннее ${rules.answer_first_max_chars_ja} знаков`);
  const t = text(a);
  for (const r of rules.forbidden_everywhere) if (new RegExp(r.pattern).test(t)) e(`запрещено «${r.pattern}»: ${r.why}`);
  for (const r of rules.forbidden_except) if (!r.allow_slugs.includes(a.slug) && new RegExp(r.pattern).test(t)) e(`«${r.pattern}» вне списка разрешённых статей: ${r.why}`);
  if (!a.update_log?.length) e('нет update_log');
  for (const l of a.update_log || []) if (/未確認|未了|公開前|試作|prototype|draft/i.test(JSON.stringify(l.public))) e('в публичной строке update_log есть служебный текст');
  if (/試作版|ネイティブチェック|下書き|公開前に、?(確認します|一次|照合)/.test(t)) e('в тексте статьи есть служебная формулировка (試作版 / ネイティブチェック / 下書き / 公開前に…確認します)');
}
for (const a of articles) {
  const t2 = JSON.stringify([a.title, a.answer_first, a.sections, a.faq, a.matome]);
  for (const p of rules.excluded_topics.patterns) { const m = t2.match(new RegExp(p)); if (m) errors.push(`${a.slug}: исключённая тема (право/налоги/условия ASP): «${m[0]}»`); }
}

// --- SEO и ссылки на источники (agents/seo-ja.md, разделы 3, 6, 9)
const norm = u => u.replace(/#.*$/, '').replace(/\/$/, '');
const hostOf = u => { try { return new URL(u).host; } catch { return null; } };
const knownHosts = new Set(sources.filter(s => /^https?:/.test(s.url)).map(s => hostOf(s.url)));
const linkRe = new RegExp(rules.source_links.link_pattern, 'g');
const kwSeen = new Map();
for (const a of articles) {
  const bad = (list, m) => (rules.source_links.enforce ? errors : warns).push(`${a.slug}: ${m}`);
  const e = m => errors.push(`${a.slug}: ${m}`), w = m => warns.push(`${a.slug}: ${m}`);
  const titleJa = a.title?.ja || '';
  if (titleJa.length > rules.seo.title_max_chars_ja) w(`title ${titleJa.length} знаков (нужно до ${rules.seo.title_max_chars_ja})`);
  if (!new RegExp(rules.seo.slug_pattern).test(a.slug)) e(`slug «${a.slug}» не латиница/дефисы`);
  const k = (a.keyword || '').trim();
  if (k) { if (kwSeen.has(k)) w(`ключ «${k}» уже у статьи ${kwSeen.get(k)} (каннибализация)`); else kwSeen.set(k, a.slug); }
  const rel = a.related || [];
  if (rel.length < rules.seo.related_min || rel.length > rules.seo.related_max) w(`related: ${rel.length} (нужно ${rules.seo.related_min}-${rules.seo.related_max})`);
  const strs = [];
  const walk = v => { if (typeof v === 'string') strs.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk([a.answer_first, a.sections, a.faq, a.matome]);
  const found = strs.flatMap(t => [...t.matchAll(linkRe)].map(m => ({ text: m[1], url: m[2] })));
  for (const l of found) {
    if (!/^https:\/\//.test(l.url)) e(`ссылка «${l.text}»: адрес не https (${l.url})`);
    else if (!knownHosts.has(hostOf(l.url))) e(`ссылка «${l.text}»: хоста ${hostOf(l.url)} нет в реестре источников`);
    else { try { if (new URL(l.url).pathname.length <= 1) w(`ссылка «${l.text}» ведёт на главную страницу, нужна конкретная страница источника`); } catch {} }
    if (rules.source_links.bad_anchors.some(b => l.text.trim().toLowerCase() === b.toLowerCase())) e(`анкор «${l.text}» запрещён (нужно описание факта или название источника)`);
  }
  const linked = new Set(found.map(l => norm(l.url)));
  for (const id of a.sources || []) {
    const s = sources.find(x => x.id === id);
    if (!s || !/^https?:/.test(s.url)) continue;
    if (!linked.has(norm(s.url))) bad([], `источник «${id}» из sources не привязан ссылкой к тексту статьи`);
  }
}

// --- очередь тем: записи, добавленные агентом (agents/topic-discovery.md)
try {
  const queue = JSON.parse(fs.readFileSync(new URL('../content/queue.json', import.meta.url), 'utf8')).queue || [];
  for (const q of queue.filter(x => x.origin === 'agent')) {
    const id = `queue «${q.keyword}»`;
    if (!q.keyword || q.keyword === '(next)') errors.push(`${id}: нет ключа`);
    if (!q.evidence?.length) errors.push(`${id}: нет evidence (запросы и страницы топа)`);
    if (!q.serp_gap || !q.angle) errors.push(`${id}: нет serp_gap или angle`);
    if (typeof q.score !== 'number' || q.score < 7) errors.push(`${id}: score ${q.score} ниже порога 7`);
    if (q.status === 'approved' && articles.some(a => a.keyword === q.keyword)) warns.push(`${id}: ключ уже есть в статьях`);
  }
} catch (e) { warns.push('queue.json не прочитан: ' + e.message); }
const site = fs.readFileSync(new URL('../prototype/index.html', import.meta.url), 'utf8');
for (const bad of ['社内メモ', 'MVP', 'Figures approved', 'Internal']) if (site.includes(bad)) errors.push(`prototype/index.html содержит «${bad}»`);
console.log(`Статей: ${articles.length}. Ошибок: ${errors.length}. Предупреждений: ${warns.length}`);
errors.forEach(x => console.log('ERROR  ' + x)); warns.forEach(x => console.log('WARN   ' + x));
process.exit(errors.length ? 1 : 0);
