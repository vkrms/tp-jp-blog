// Валидатор контента. Запуск: node tools/validate.mjs   (exit code 1, если есть ошибки)
import fs from 'node:fs';
const read = p => JSON.parse(fs.readFileSync(new URL('../content/' + p, import.meta.url), 'utf8'));
const articles = read('articles.json');
const { sources } = read('sources.json');
const rules = read('rules.json');
const srcIds = new Set(sources.map(s => s.id));
const errors = [], warns = [];
const text = a => JSON.stringify([a.title, a.answer_first, a.sections, a.faq, a.matome]);
for (const a of articles) {
  const e = m => errors.push(`${a.slug}: ${m}`), w = m => warns.push(`${a.slug}: ${m}`);
  for (const f of rules.required_fields) if (a[f] == null || (Array.isArray(a[f]) && !a[f].length && f !== 'sources')) e(`нет поля ${f}`);
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
const site = fs.readFileSync(new URL('../prototype/index.html', import.meta.url), 'utf8');
for (const bad of ['社内メモ', 'MVP', 'Figures approved', 'Internal']) if (site.includes(bad)) errors.push(`prototype/index.html содержит «${bad}»`);
console.log(`Статей: ${articles.length}. Ошибок: ${errors.length}. Предупреждений: ${warns.length}`);
errors.forEach(x => console.log('ERROR  ' + x)); warns.forEach(x => console.log('WARN   ' + x));
process.exit(errors.length ? 1 : 0);
