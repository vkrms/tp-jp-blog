// node tools/repair-json.mjs [files...]  — чинит типографские кавычки у ключей JSON (tools/lib/repair-json.mjs).
// Без аргументов: content/articles.json, content/queue.json, content/sources.json, content/glossary.json, agent-out/report.json.
// Пишет итог в stdout и в agent-out/repairs.md; код выхода 1, если какой-то файл так и не разбирается.
import fs from 'node:fs';
import { repairJsonText } from './lib/repair-json.mjs';

const ROOT = new URL('../', import.meta.url);
const files = process.argv.slice(2).length ? process.argv.slice(2)
  : ['content/articles.json', 'content/queue.json', 'content/sources.json', 'content/glossary.json', 'agent-out/report.json'];

const lines = [];
let broken = 0;
for (const f of files) {
  const url = new URL(f, ROOT);
  if (!fs.existsSync(url)) continue;
  const r = repairJsonText(fs.readFileSync(url, 'utf8'));
  if (!r.ok) { broken++; lines.push(`- ${f}: JSON не разбирается, автоматический ремонт не помог`); continue; }
  if (r.fixed) { fs.writeFileSync(url, r.text); lines.push(`- ${f}: исправлено кавычек у ключей: ${r.fixed}`); }
}
const out = lines.length ? `Ремонт JSON:\n${lines.join('\n')}` : 'Ремонт JSON: не понадобился';
console.log(out);
if (lines.length && fs.existsSync(new URL('agent-out/', ROOT))) fs.writeFileSync(new URL('agent-out/repairs.md', ROOT), out + '\n');
process.exit(broken ? 1 : 0);
