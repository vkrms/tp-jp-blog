#!/usr/bin/env node
// Метрики статьи: объём текста и состав блоков. Запуск: node tools/article-stats.mjs [slug ...]  (без аргументов — все статьи)
// Сравнивается с профилем из content/article-profile.json (эталон + цели).
import fs from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(new URL(p, ROOT), 'utf8'));
const articles = read('content/articles.json');
const profile = read('content/article-profile.json');

const strip = (s) => (s || '').replace(/\*\*/g, '');
const jaLen = (pair) => strip(Array.isArray(pair) ? pair[0] : pair?.ja).replace(/\s/g, '').length;

export function stats(a) {
  const types = {};
  let chars = 0, paraChars = 0;
  for (const s of a.sections) {
    chars += jaLen(s.h);
    for (const b of s.b) {
      const k = Object.keys(b)[0];
      types[k] = (types[k] || 0) + 1;
      const v = b[k];
      if (k === 'p') { chars += jaLen(v); paraChars += jaLen(v); }
      else if (k === 'h3') chars += jaLen(v);
      else if (k === 'list' || k === 'steps') chars += v.reduce((n, x) => n + jaLen(x), 0);
      else if (k === 'table') chars += v.rows.flat().reduce((n, x) => n + jaLen(x), 0);
      else if (k === 'point' || k === 'warn' || k === 'diff' || k === 'say') chars += v.reduce((n, x) => n + jaLen(x), 0);
      else if (k === 'img') chars += jaLen(v.caption);
    }
  }
  chars += jaLen(a.answer_first) + a.faq.reduce((n, f) => n + jaLen(f[0]) + jaLen(f[1]), 0) + a.matome.reduce((n, m) => n + jaLen(m), 0);
  const bodyChars = chars;
  const structural = (types.list || 0) + (types.steps || 0) + (types.table || 0) + (types.img || 0) + (types.point || 0) + (types.warn || 0) + (types.diff || 0) + (types.quote || 0);
  return { slug: a.slug, sections: a.sections.length, h3: types.h3 || 0, chars: bodyChars, paraChars, paragraphs: types.p || 0, lists: (types.list || 0) + (types.steps || 0), tables: types.table || 0, images: types.img || 0, callouts: (types.point || 0) + (types.warn || 0), diffs: types.diff || 0, quotes: types.quote || 0, faq: a.faq.length, structural, paraShare: +(paraChars / bodyChars).toFixed(2), paraPerStructural: structural ? +((types.p || 0) / structural).toFixed(1) : null };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const want = process.argv.slice(2);
  const rows = articles.filter((a) => !want.length || want.includes(a.slug)).map(stats);
  console.table(rows);
  console.log('reference (is-affiliate-marketing-worth-it):', JSON.stringify(profile.reference.measured));
}
