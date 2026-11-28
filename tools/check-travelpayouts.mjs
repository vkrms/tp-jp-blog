// Проверка утверждений о Travelpayouts против одобренных фактов после запуска агента (tools/lib/check-travelpayouts.mjs).
//   node tools/check-travelpayouts.mjs --base <sha>
// Пишет agent-out/travelpayouts.json (читает гейт) и agent-out/travelpayouts.md (идёт в PR). Код выхода 0 всегда:
// ошибка — в отчёт, гейт сам решит держать PR или нет.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chat } from './lib/openrouter.mjs';
import { changedTpSentences, buildMessages, parseFindings } from './lib/check-travelpayouts.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (name, d = '') => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const MODEL = process.env.VERIFY_MODEL || 'anthropic/claude-sonnet-4.5';

/** «## О Travelpayouts (только это)» из agents/rules.md — текст между этим заголовком и следующим «## ». */
function approvedRulesText() {
  const md = read('agents/rules.md');
  const m = /^## О Travelpayouts[^\n]*\n([\s\S]*?)(?=\n## |$)/m.exec(md);
  if (!m) throw new Error('agents/rules.md: не нашёл раздел «## О Travelpayouts»');
  return m[1].trim();
}

const base = arg('base') || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
let check = { items: 0 };
try {
  const baseArticles = JSON.parse(execFileSync('git', ['show', `${base}:content/articles.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
  const newArticles = JSON.parse(read('content/articles.json'));
  const rules = JSON.parse(read('content/rules.json'));
  const approved = {
    rulesText: approvedRulesText(),
    notes: rules.notes?.filter((n) => /travelpayouts|конкурент|налог/i.test(n)) ?? [],
  };
  const items = changedTpSentences(baseArticles, newArticles);
  check = { items: items.length, model: MODEL };
  if (items.length) {
    let messages = buildMessages(items, approved);
    for (let attempt = 1; ; attempt++) {
      const { content } = await chat({ model: MODEL, messages, temperature: 0, max_tokens: 2000, title: 'seo-blog-travelpayouts', json: true });
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
fs.writeFileSync(new URL('agent-out/travelpayouts.json', ROOT), JSON.stringify(check, null, 1) + '\n');
const md = !check.items ? 'Проверка утверждений о Travelpayouts: новых упоминаний нет.'
  : check.error ? `Проверка утверждений о Travelpayouts: **не выполнена** (${check.error}).`
    : check.findings.length
      ? ['Проверка утверждений о Travelpayouts: **найдено**', ...check.findings.map((f) => `- ${f.slug}: «${f.evidence}» — ${f.reason}`)].join('\n')
      : `Проверка утверждений о Travelpayouts (${check.model}): всё подтверждено одобренными фактами.`;
fs.writeFileSync(new URL('agent-out/travelpayouts.md', ROOT), md + '\n');
console.log(md);
