// node tools/repair-json.mjs [--base <sha>] [files...]  — чинит типографские кавычки на месте JSON-разделителей
// (tools/lib/repair-json.mjs). Без файлов: content/articles.json, content/queue.json, content/sources.json,
// content/glossary.json, agent-out/report.json. `--base` — коммит, с которым сравнивать (строки, бывшие в нём
// дословно, не трогаем); без него правятся все строки (годится для agent-out/report.json — его в git нет).
// Пишет итог в stdout и в agent-out/repairs.md; код выхода 1, если какой-то файл так и не разбирается.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { repairJsonText } from './lib/repair-json.mjs';

const ROOT = new URL('../', import.meta.url);
const argv = process.argv.slice(2);
const baseIdx = argv.indexOf('--base');
const base = baseIdx >= 0 ? argv[baseIdx + 1] : null;
const files = (baseIdx >= 0 ? [...argv.slice(0, baseIdx), ...argv.slice(baseIdx + 2)] : argv).filter(Boolean);
const targets = files.length ? files
  : ['content/articles.json', 'content/queue.json', 'content/sources.json', 'content/glossary.json', 'agent-out/report.json'];

function baseContentOf(file) {
  if (!base) return null;
  try { return execFileSync('git', ['show', `${base}:${file}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }); }
  catch { return null; } // файла не было в базовом коммите (новый файл, напр. agent-out/report.json) — правим всё
}

const lines = [];
let broken = 0;
for (const f of targets) {
  const url = new URL(f, ROOT);
  if (!fs.existsSync(url)) continue;
  const r = repairJsonText(fs.readFileSync(url, 'utf8'), baseContentOf(f));
  if (!r.ok) { broken++; lines.push(`- ${f}: JSON не разбирается, автоматический ремонт не помог`); continue; }
  if (r.fixed) { fs.writeFileSync(url, r.text); lines.push(`- ${f}: исправлено кавычек-разделителей: ${r.fixed}`); }
}
const out = lines.length ? `Ремонт JSON:\n${lines.join('\n')}` : 'Ремонт JSON: не понадобился';
console.log(out);
if (lines.length && fs.existsSync(new URL('agent-out/', ROOT))) fs.writeFileSync(new URL('agent-out/repairs.md', ROOT), out + '\n');
process.exit(broken ? 1 : 0);
