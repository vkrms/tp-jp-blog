// Проверка новых/изменённых утверждений о Travelpayouts против одобренных фактов (agents/rules.md, «О
// Travelpayouts (только это)»), а не против уже опубликованных формулировок дословно. Раньше гейт держал любое
// предложение о Travelpayouts, которого не было в корпусе байт-в-байт, — это сильнее, чем написано в спецификации
// (docs/spec.md §6: «сверка чисел о Travelpayouts с tp_approved_numbers», т.е. проверка по фактам) и держало даже
// точные, корректные формулировки одобренных цифр просто потому, что их раньше никто не писал.
import { publicStrings } from './verify-numbers.mjs';

/** Предложения публичного текста статьи, где упоминается Travelpayouts (title, eyebrow, answer_first, sections, faq, matome). */
export function tpSentences(article) {
  const strings = [];
  const walk = (v) => { if (typeof v === 'string') strings.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk); };
  walk([article.title, article.eyebrow, article.answer_first, article.sections, article.faq, article.matome]);
  return strings
    .flatMap((t) => t.split(/(?<=[。．！？!?])|(?<=\.)\s+/))
    .map((t) => t.trim())
    .filter((t) => /travelpayouts|トラベルペイアウツ/i.test(t));
}

/** Новые/изменённые TP-предложения по статьям: { slug, text }[]. Статья без изменений не попадает. */
export function changedTpSentences(baseArticles, newArticles) {
  const base = new Map(baseArticles.map((a) => [a.slug, new Set(tpSentences(a))]));
  const out = [];
  for (const a of newArticles) {
    const before = base.get(a.slug) ?? new Set();
    for (const t of tpSentences(a)) {
      if (before.has(t) || out.some((x) => x.slug === a.slug && x.text === t)) continue;
      out.push({ slug: a.slug, text: t });
    }
  }
  return out;
}

/** @param {{rulesText: string, notes?: string[]}} approved — «О Travelpayouts» из agents/rules.md + заметки rules.json */
export function buildMessages(items, approved) {
  const system = [
    'You review new or changed text of a Japanese travel-affiliate blog for claims about Travelpayouts (a travel',
    'affiliate platform), checking them against the facts and tone the content owner approved below — not against',
    'whether this exact sentence has been published before. A new sentence that accurately restates an approved',
    'fact, even in brand-new wording, is fine.',
    '',
    'Approved facts and tone (the ONLY things the text may say about Travelpayouts):',
    approved.rulesText,
    approved.notes?.length ? ['Additional rules:', ...approved.notes.map((n) => `- ${n}`)].join('\n') : '',
    '',
    'Flag a claim only if it states something about Travelpayouts (capabilities, conditions, numbers, compatibility',
    'with something, availability) that the approved facts above do NOT support, or that uses a forbidden number/',
    'phrase, promises income, or names a competitor in Travelpayouts copy.',
    'Do NOT flag a claim that only restates an approved fact or tone point, however it is phrased.',
    'Answer with JSON only: {"findings":[{"slug":"...","evidence":"short quote from the text","reason":"one sentence: what exactly is unsupported or wrong"}]}',
    'Return {"findings":[]} if every claim is consistent with the approved facts.',
  ].filter(Boolean).join('\n');
  const user = ['## New or changed sentences mentioning Travelpayouts', ...items.map((x, i) => `[${i}] (${x.slug}) ${x.text}`)].join('\n');
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
  if (check.error) return [`проверка утверждений о Travelpayouts не выполнена (${check.error}) — новый текст проверить вручную`];
  return (check.findings ?? []).map((f) => `${f.slug}: утверждение о Travelpayouts не подтверждено одобренными фактами: «${String(f.evidence).slice(0, 90)}» — ${String(f.reason ?? '').slice(0, 120)}`);
}
