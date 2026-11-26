// Единая терминология проекта: агент обновления называется «updater» (не «обновлятор», не «апдейтер»).
// Хранится в наших файлах, а не в материалах от владельца контента: после каждой новой передачи (handoff)
// проверка снова находит старые слова, а --fix их заменяет.
//   node tools/terms.mjs         проверка; код выхода 1, если что-то найдено
//   node tools/terms.mjs --fix   замена во всех отслеживаемых текстовых файлах
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);

/** Старое слово в любом падеже/числе → замена (заглавная буква сохраняется). */
export const TERMS = [
  { re: /(обновлятор|апдейтер)(ами|ам|ах|ов|ом|ы|а|у|е)?(?![а-яё])/giu, to: 'updater' },
];
const EXT = /\.(md|json|ya?ml|mjs|js|ts|astro|php|txt|html)$/;
const SKIP = /(^|\/)(node_modules|vendor|dist|prototype)\//;
// Файлы, где старые слова названы намеренно (само правило): их не проверяем и не правим.
const ALLOW = new Set(['tools/terms.mjs', 'AGENTS.md', '.github/workflows/validate.yml']);

export function replaceTerms(text) {
  let count = 0;
  for (const { re, to } of TERMS) {
    text = text.replace(re, (m) => { count++; return m[0] === m[0].toUpperCase() ? to[0].toUpperCase() + to.slice(1) : to; });
  }
  return { text, count };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();

function main() {
  const files = execFileSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && EXT.test(f) && !SKIP.test(f) && !ALLOW.has(f) && !f.endsWith('.test.mjs'));

  const fix = process.argv.includes('--fix');
  const hits = [];
  for (const f of files) {
    const url = new URL(f, ROOT);
    if (!fs.existsSync(url)) continue;
    const before = fs.readFileSync(url, 'utf8');
    const { text, count } = replaceTerms(before);
    if (!count) continue;
    hits.push(`${f}: ${count}`);
    if (fix) fs.writeFileSync(url, text);
  }

  if (!hits.length) { console.log('terms: ok (updater)'); process.exit(0); }
  console.log(`${fix ? 'terms: replaced with «updater»' : 'terms: old names for the updater found (run: npm run terms:fix)'}\n  ${hits.join('\n  ')}`);
  process.exit(fix ? 0 : 1);
}
