import { holdReasons as numberHoldReasons } from './verify-numbers.mjs';

// Решение о публикации результата агента — код, а не модель (docs/launch-plan.md, «Guardrails»).
// Чистые функции без git и файлов: их проверяют тесты (tools/agent-gate.test.mjs), CLI — tools/agent-gate.mjs.

/** Файлы, которые агенту разрешено менять. Всё остальное — отказ. */
export const ALLOWED_FILES = [
  'content/articles.json',
  'content/facts.yaml',
  'content/sources.json',
  'content/queue.json',
  'content/glossary.json',
];

/** Предложения публичного текста статьи, где упоминается Travelpayouts (title, answer_first, sections, faq, matome). */
export function tpSentences(article) {
  const strings = [];
  const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk([article.title, article.eyebrow, article.answer_first, article.sections, article.faq, article.matome]);
  return strings
    .flatMap((t) => t.split(/(?<=[。．！？!?])|(?<=\.)\s+/))
    .map((t) => t.trim())
    .filter((t) => /travelpayouts|トラベルペイアウツ/i.test(t));
}

/** Минимальный разбор content/policy.yaml: только нужные ключи (без YAML-зависимостей). */
export function parsePolicy(yaml) {
  const val = (re, d) => { const m = yaml.match(re); return m ? m[1] : d; };
  const num = (re, d) => Number(val(re, d));
  return {
    publish_mode: val(/^publish_mode:\s*(\w+)/m, 'review'),
    paused: val(/^paused:\s*(true|false)/m, 'true') === 'true', // неразборчиво → считаем, что пауза
    max_new_articles_per_week: num(/^\s+max_new_articles_per_week:\s*(\d+)/m, 2),
    max_changed_articles_per_run: num(/^\s+max_changed_articles_per_run:\s*(\d+)/m, 10),
    topic_discovery: val(/^topic_discovery:[^\n]*\n\s+enabled:\s*(true|false)/m, 'false') === 'true',
  };
}

const firstPublished = (a) => a.update_log?.[0]?.date ?? a.updated_at;
const daysAgo = (iso, now) => (now - new Date(`${iso}T00:00:00Z`)) / 86400000;

/** Статьи, впервые опубликованные за последние 7 дней. */
export const publishedLastWeek = (articles, now = new Date()) =>
  articles.filter((a) => { const d = firstPublished(a); return d && daysAgo(d, now) < 7; });

/** Можно ли вообще запускать задачу. @returns {{run: boolean, reason?: string}} */
export function preCheck({ task, policy, articles, now = new Date() }) {
  if (policy.paused) return { run: false, reason: 'policy.yaml: paused = true' };
  if (task === 'writer') {
    const n = publishedLastWeek(articles, now).length;
    if (n >= policy.max_new_articles_per_week) return { run: false, reason: `лимит: уже ${n} новых статей за 7 дней (max ${policy.max_new_articles_per_week})` };
  }
  return { run: true };
}

/**
 * Решение по результату запуска.
 * @returns {{decision: 'merge'|'hold'|'reject'|'empty', reasons: string[], summary: object}}
 *   merge  — всё чисто, можно вливать (если publish_mode = auto и не dry run);
 *   hold   — PR открыть, но не вливать (нужен человек);
 *   reject — нарушение границ (чужие файлы, удаление статей, ошибки валидатора): PR не открывать;
 *   empty  — агент ничего не изменил.
 */
export function postCheck({ task, slug, policy, baseArticles, newArticles, changedFiles, validatorOk, report, numberCheck = null, now = new Date() }) {
  const reject = [], hold = [];
  const files = changedFiles.filter((f) => !f.startsWith('agent-out/'));
  if (!files.length) return { decision: 'empty', reasons: ['агент ничего не изменил'], summary: {} };

  for (const f of files) if (!ALLOWED_FILES.includes(f)) reject.push(`изменён запрещённый файл: ${f}`);
  if (!validatorOk) reject.push('node tools/validate.mjs: есть ошибки');

  const base = new Map(baseArticles.map((a) => [a.slug, a]));
  const next = new Map(newArticles.map((a) => [a.slug, a]));
  const removed = [...base.keys()].filter((s) => !next.has(s));
  const added = [...next.keys()].filter((s) => !base.has(s));
  const changed = [...next.keys()].filter((s) => base.has(s) && JSON.stringify(base.get(s)) !== JSON.stringify(next.get(s)));

  if (removed.length) reject.push(`удалены или переименованы статьи: ${removed.join(', ')} (slug после публикации не меняется)`);

  if (task === 'writer') {
    if (added.length > 1) reject.push(`за запуск больше одной новой статьи: ${added.join(', ')}`);
    const week = publishedLastWeek(baseArticles, now).length + added.length;
    if (week > policy.max_new_articles_per_week) hold.push(`лимит новых статей за 7 дней: ${week} > ${policy.max_new_articles_per_week}`);
  } else if (added.length) {
    reject.push(`${task} не создаёт статьи: ${added.join(', ')}`);
  }
  if (task === 'editor' && slug) {
    const others = changed.filter((s) => s !== slug);
    if (others.length) hold.push(`редактор изменил не только ${slug}: ${others.join(', ')}`);
  }
  if (changed.length > policy.max_changed_articles_per_run) {
    hold.push(`изменено статей: ${changed.length} > ${policy.max_changed_articles_per_run}`);
  }

  // Дата обновления двигается только вместе с новой строкой 更新履歴 (agents/seo-ja.md §2).
  for (const s of changed) {
    const b = base.get(s), n = next.get(s);
    if (b.updated_at !== n.updated_at && (n.update_log?.length ?? 0) <= (b.update_log?.length ?? 0)) {
      hold.push(`${s}: updated_at изменён без новой строки update_log (освежение даты запрещено)`);
    }
  }

  // О Travelpayouts — только утверждённые формулировки (agents/rules.md): любое новое предложение с Travelpayouts
  // в публичном тексте проверяет человек по TP Messagings.
  const knownTp = new Set(baseArticles.flatMap(tpSentences));
  for (const s of [...added, ...changed]) {
    const fresh = tpSentences(next.get(s)).filter((t) => !knownTp.has(t));
    if (fresh.length) hold.push(`${s}: новые утверждения о Travelpayouts — сверить с TP Messagings: «${fresh[0].slice(0, 90)}»${fresh.length > 1 ? ` (+${fresh.length - 1})` : ''}`);
  }

  // Автосверка изменённых цифр с источниками (tools/verify-numbers.mjs): расхождение — PR ждёт человека.
  hold.push(...numberHoldReasons(numberCheck));

  if (!report) hold.push('нет отчёта агента (agent-out/report.json)');
  else {
    if (report.needs_human) hold.push(`агент просит человека: ${report.needs_human_reason || 'без причины'}`);
    if (report.injection_suspected) hold.push('агент подозревает prompt injection на внешней странице');
  }
  if (policy.paused) hold.push('policy.yaml: paused = true');
  if (policy.publish_mode !== 'auto') hold.push(`publish_mode = ${policy.publish_mode}`);

  const decision = reject.length ? 'reject' : hold.length ? 'hold' : 'merge';
  return { decision, reasons: [...reject, ...hold], summary: { added, changed, removed } };
}
