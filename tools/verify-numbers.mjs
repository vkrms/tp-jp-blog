// Сверка изменённых цифр с источниками после запуска агента (tools/lib/verify-numbers.mjs).
//   node tools/verify-numbers.mjs --base <sha>
// Скачивает страницы источников (только https и хосты реестра), спрашивает модель (VERIFY_MODEL), пишет
// agent-out/numbers.json (читает гейт) и agent-out/numbers.md (идёт в PR). Код выхода 0 всегда: ошибка записывается в отчёт.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { chat } from './lib/openrouter.mjs';
import { changedFigures, sourceUrls, htmlToText, buildMessages, parseResults, isRealMismatch } from './lib/verify-numbers.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (name, d = '') => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const MODEL = process.env.VERIFY_MODEL || 'anthropic/claude-sonnet-4.5';
const PAGE_CHARS = 20000;

async function fetchText(url) {
  const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'User-Agent': 'Mozilla/5.0 (compatible; content-check)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const finalHost = new URL(res.url).hostname.replace(/^www\./, '');
  if (finalHost !== new URL(url).hostname.replace(/^www\./, '')) throw new Error(`redirected off-host to ${finalHost}`);
  return htmlToText((await res.text()).slice(0, 3_000_000)).slice(0, PAGE_CHARS);
}

const write = (check) => {
  fs.mkdirSync(new URL('agent-out/', ROOT), { recursive: true });
  fs.writeFileSync(new URL('agent-out/numbers.json', ROOT), JSON.stringify(check, null, 1) + '\n');
  const rows = (check.results ?? []).filter((r) => r.status !== 'not_applicable')
    .map((r) => `| ${r.status === 'mismatch' && !isRealMismatch(r) ? '✅' : ({ ok: '✅', mismatch: '❌', unverifiable: '❔' }[r.status] ?? r.status)} | ${String(r.figure).replace(/\|/g, '/')} | ${String(r.source_says ?? '').replace(/\|/g, '/').slice(0, 120)} |`);
  const md = !check.statements ? 'Автосверка цифр: изменённых цифр нет.'
    : check.error ? `Автосверка цифр: **не выполнена** (${check.error}).`
      : [`Автосверка цифр (${check.model}, страниц: ${check.pages.length}):`, '', '| | В статье | В источнике |', '|---|---|---|', ...rows].join('\n');
  fs.writeFileSync(new URL('agent-out/numbers.md', ROOT), md + '\n');
  console.log(md);
};

const base = arg('base') || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim();
let check = { statements: 0 };
try {
  const baseArticles = JSON.parse(execFileSync('git', ['show', `${base}:content/articles.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
  const newArticles = JSON.parse(read('content/articles.json'));
  const { sources } = JSON.parse(read('content/sources.json'));
  const figures = changedFigures(baseArticles, newArticles);
  check = { statements: figures.length, figures, model: MODEL, pages: [] };
  if (figures.length) {
    const urls = sourceUrls(figures, newArticles, sources);
    const pages = [];
    for (const url of urls) {
      try { pages.push({ url, text: await fetchText(url) }); check.pages.push({ url, ok: true }); }
      catch (e) { check.pages.push({ url, ok: false, error: e.message }); }
    }
    if (!urls.length) throw new Error('у изменённых статей нет ссылок и источников из реестра — сверять не с чем');
    if (!pages.length) throw new Error('не удалось скачать ни одной страницы-источника');
    // Модель иногда отдаёт невалидный JSON (неэкранированные кавычки в цитатах): JSON-режим и один повтор.
    let messages = buildMessages(figures, pages);
    for (let attempt = 1; ; attempt++) {
      const { content, usage } = await chat({ model: MODEL, messages, temperature: 0, max_tokens: 6000, title: 'seo-blog-verify', json: true });
      try { check.results = parseResults(content); check.cost_usd = usage?.cost ?? null; break; }
      catch (e) {
        if (attempt >= 2) throw new Error(`ответ модели не JSON: ${e.message}`);
        messages = [...messages, { role: 'assistant', content }, { role: 'user', content: 'That was not valid JSON. Reply again with valid JSON only, escaping double quotes inside strings.' }];
      }
    }
  }
} catch (e) {
  check.error = e.message.slice(0, 200);
}
write(check);
