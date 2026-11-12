#!/usr/bin/env node
// Переносит одну статью из content/articles.json в прототип (prototype/src/data*.js) и пересобирает
// prototype/index.html. Прототип хранит контент в упрощённом JS-формате (короткие ключи), отдельном от
// схемы БД в articles.json — это не автосинхронизируемые копии, перенос делает этот скрипт по запросу.
// Использование: node tools/sync-prototype.mjs <slug> [--dry]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const slug = process.argv[2];
if (!slug) throw new Error('usage: node tools/sync-prototype.mjs <slug> [--dry]');
const dry = process.argv.includes('--dry');

const article = JSON.parse(read('content/articles.json')).find((a) => a.slug === slug);
if (!article) throw new Error(`no article "${slug}" in content/articles.json`);

// Сериализация в JS-литерал (одинарные кавычки, как в data*.js). Безопасно, пока в тексте статей нет
// фигурных скобок (проверено для всех текущих статей) — поиск границы объекта ниже считает именно { }.
const str = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const pair = (p) => `[${str(p[0])},${str(p[1])}]`;
const block = (b) => {
  if (b.p) return `{p:${pair(b.p)}}`;
  if (b.h3) return `{h3:${pair(b.h3)}}`;
  if (b.img) return `{img:{src:${str(b.img.src)},alt:${pair(b.img.alt)},caption:${pair(b.img.caption)}}}`;
  if (b.list) return `{list:[${b.list.map(pair).join(',')}]}`;
  if (b.steps) return `{steps:[${b.steps.map(pair).join(',')}]}`;
  if (b.table) return `{table:{head:[${b.table.head.map(pair).join(',')}],rows:[${b.table.rows.map((r) => `[${r.map(pair).join(',')}]`).join(',\n   ')}]}}`;
  if (b.point) return `{point:[${pair(b.point[0])},${pair(b.point[1])}]}`;
  if (b.warn) return `{warn:[${pair(b.warn[0])},${pair(b.warn[1])}]}`;
  if (b.diff) return `{diff:[${pair(b.diff[0])},${pair(b.diff[1])}]}`;
  if (b.say) return `{say:${pair(b.say)}}`;
  throw new Error(`unknown block type: ${Object.keys(b)[0]}`);
};
const section = (s) => `{h:${pair(s.h)},b:[\n  ${s.b.map(block).join(',\n  ')}]}`;
// Первая строка истории всегда «初版を公開»/«First published» через LG(); остальные — литералом (своя public-строка).
const logEntry = (l, i) => (i === 0 ? `LG(${str(l.internal_note.ja)},${str(l.internal_note.en)})` : `[${str(l.date)},${pair([l.public.ja, l.public.en])},${pair([l.internal_note.ja, l.internal_note.en])}]`);

const obj = `{id:${str(article.slug)},cat:${str(article.category)},icon:${str(article.icon)},read:${article.read_minutes},lvl:${article.level},
 kw:${str(article.keyword)},
 t:${pair([article.title.ja, article.title.en])},
 eye:${pair([article.eyebrow.ja, article.eyebrow.en])},
 s:${pair([article.answer_first.ja, article.answer_first.en])},
 secs:[
 ${article.sections.map(section).join(',\n ')}],
 matome:[${article.matome.map(pair).join(',')}],
 faq:[
  ${article.faq.map((f) => `[${pair(f[0])},${pair(f[1])}]`).join(',\n  ')}],
 src:[${article.sources.map(str).join(',')}],
 log:[${article.update_log.map(logEntry).join(', ')}],
 rel:[${(article.related || []).map(str).join(',')}]}`;

// Найти существующий объект {id:'<slug>',...} в data2.js/data3.js и заменить его на новый (баланс { }:
// безопасно, т.к. ни одна строка контента не содержит фигурных скобок — проверено для всех статей).
const files = ['data.js', 'data2.js', 'data3.js'];
let done = false;
for (const file of files) {
  const path = `prototype/src/${file}`;
  const src = read(path);
  const marker = `{id:${str(article.slug)}`;
  const start = src.indexOf(marker);
  if (start === -1) continue;
  let depth = 0, end = -1;
  for (let i = start; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
  }
  if (end === -1) throw new Error(`${file}: unbalanced braces from "${marker}"`);
  const next = src.slice(0, start) + obj + src.slice(end);
  console.log(`${file}: replacing ${end - start} chars with ${obj.length} chars`);
  if (!dry) fs.writeFileSync(new URL(path, ROOT), next);
  done = true;
  break;
}
if (!done) throw new Error(`"${slug}" not found in any of ${files.join(', ')} — add it as a new entry by hand first`);
if (dry) { console.log('dry run: prototype/src not modified, index.html not rebuilt'); process.exit(0); }

execFileSync('python3', ['build_prod.py'], { cwd: new URL('prototype/src', ROOT), stdio: 'inherit' });
fs.copyFileSync(new URL('prototype/src/prod/index.html', ROOT), new URL('prototype/index.html', ROOT));
console.log('done: prototype/index.html rebuilt');
