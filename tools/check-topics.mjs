// Смысловая проверка исключённых тем после запуска агента (tools/lib/check-topics.mjs).
//   node tools/check-topics.mjs --base <sha>
// Пишет agent-out/topics.json (читает гейт) и agent-out/topics.md (идёт в PR). Код выхода 0 всегда: ошибка — в отчёт.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chat } from './lib/openrouter.mjs';
import { changedText, buildMessages, parseFindings } from './lib/check-topics.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (name, d = '') => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const MODEL = process.env.VERIFY_MODEL || 'anthropic/claude-sonnet-4.5';

const base = arg('base') || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
let check = { items: 0 };
try {
  const baseArticles = JSON.parse(execFileSync('git', ['show', `${base}:content/articles.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
  const newArticles = JSON.parse(read('content/articles.json'));
  const excluded = JSON.parse(read('content/rules.json')).excluded_topics;
  const items = changedText(baseArticles, newArticles);
  check = { items: items.length, model: MODEL };
  if (items.length) {
    let messages = buildMessages(items, excluded);
    for (let attempt = 1; ; attempt++) {
      const { content } = await chat({ model: MODEL, messages, temperature: 0, max_tokens: 3000, title: 'seo-blog-topics', json: true });
      try { check.findings = parseFindings(content); break; }
      catch (e) {
        if (attempt >= 2) throw new Error(`ответ модели не JSON: ${e.message}`);
        messages = [...messages, { role: 'assistant', content }, { role: 'user', content: 'That was not valid JSON. Reply again with valid JSON only, escaping double quotes inside strings.' }];
      }
    }
  }
} catch (e) {
  check.error = e.message.slice(0, 200);
}

fs.mkdirSync(new URL('agent-out/', ROOT), { recursive: true });
fs.writeFileSync(new URL('agent-out/topics.json', ROOT), JSON.stringify(check, null, 1) + '\n');
const md = !check.items ? 'Проверка исключённых тем: нового текста нет.'
  : check.error ? `Проверка исключённых тем: **не выполнена** (${check.error}).`
    : check.findings.length
      ? ['Проверка исключённых тем: **найдено**', ...check.findings.map((f) => `- ${f.slug} (${f.topic}): «${f.evidence}» — ${f.reason}`)].join('\n')
      : `Проверка исключённых тем (${check.model}): не найдено.`;
fs.writeFileSync(new URL('agent-out/topics.md', ROOT), md + '\n');
console.log(md);
