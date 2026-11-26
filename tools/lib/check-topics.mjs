// Смысловая проверка исключённых тем (право и маркировка рекламы, налоги и доход, условия ASP) в новом/изменённом
// тексте после запуска агента. Регулярки валидатора ловят слова; эта проверка ловит пересказ другими словами
// (пробный запуск writer 2026-11-26: «PR表示義務», «提携解除» прошли валидатор). Чистые функции; сеть — tools/check-topics.mjs.
import { publicStrings } from './verify-numbers.mjs';

/** Новые/изменённые строки публичного текста по статьям: { slug, text }[] (без ограничения на цифры). */
export function changedText(baseArticles, newArticles, maxChars = 30000) {
  const base = new Map(baseArticles.map((a) => [a.slug, new Set(publicStrings(a))]));
  const out = [];
  let size = 0;
  for (const a of newArticles) {
    const before = base.get(a.slug) ?? new Set();
    for (const t of publicStrings(a)) {
      if (before.has(t) || !t.trim() || out.some((x) => x.slug === a.slug && x.text === t)) continue;
      if (size + t.length > maxChars) return out;
      out.push({ slug: a.slug, text: t });
      size += t.length;
    }
  }
  return out;
}

export function buildMessages(items, excluded) {
  const system = [
    'You review new text of a Japanese affiliate-marketing blog for topics the owner has excluded.',
    'Excluded topics (the site must not explain, advise on or state rules about these):',
    ...excluded.topics.map((t) => `- ${t}`),
    excluded.description ? `Why: ${excluded.description}` : '',
    'Flag text that explains or states obligations, rules, legal requirements, disclosure/labelling duties (PR表示 etc.),',
    'tax or income-reporting matters, or ASP/platform conditions (registration or approval rules, where links may be placed,',
    'penalties such as 提携解除, payout terms, minimums, commissions, rates) — in any wording.',
    'Do NOT flag: merely mentioning that ASPs exist, general explanations of how affiliate marketing works, earnings survey',
    'statistics, travel statistics, SEO advice, or neutral references without rules or advice.',
    'Answer with JSON only: {"findings":[{"slug":"...","topic":"law_ads|tax_income|asp_terms","evidence":"short quote from the text","reason":"one sentence"}]}',
    'Return {"findings":[]} if nothing is excluded.',
  ].filter(Boolean).join('\n');
  const user = ['## New or changed text', ...items.map((x, i) => `[${i}] (${x.slug}) ${x.text}`)].join('\n');
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

export function parseFindings(content) {
  const json = content.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, '$1');
  const parsed = JSON.parse(json);
  if (!Array.isArray(parsed.findings)) throw new Error('no findings array');
  return parsed.findings;
}

/** @returns {string[]} причины задержать PR */
export function holdReasons(check) {
  if (!check || !check.items) return [];
  if (check.error) return [`проверка исключённых тем не выполнена (${check.error}) — новый текст проверить вручную`];
  return (check.findings ?? []).map((f) => `${f.slug}: возможна исключённая тема (${f.topic}): «${String(f.evidence).slice(0, 90)}» — ${String(f.reason ?? '').slice(0, 120)}`);
}
