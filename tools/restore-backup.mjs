#!/usr/bin/env node
// Откат статьи к сохранённой резервной копии (content/backups/<slug>.initial.json или --from=путь).
// Использование: node tools/restore-backup.mjs <slug> [--from=path] [--dry]
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const slug = process.argv[2];
if (!slug) throw new Error('usage: node tools/restore-backup.mjs <slug> [--from=path] [--dry]');
const dry = process.argv.includes('--dry');

const backupPath = arg('from', `content/backups/${slug}.initial.json`);
const backup = JSON.parse(read(backupPath));
const restored = backup.article;
if (!restored || restored.slug !== slug) throw new Error(`backup at ${backupPath} does not hold an article for "${slug}"`);

const articles = JSON.parse(read('content/articles.json'));
if (!articles.some((a) => a.slug === slug)) throw new Error(`no article "${slug}" in content/articles.json`);
const next = articles.map((a) => (a.slug === slug ? restored : a));

console.log(`restoring ${slug} from ${backupPath} (backed up ${backup.backed_up_at}, source commit ${backup.source_commit})`);
if (dry) { console.log('dry run: content/articles.json not modified'); process.exit(0); }

const orig = read('content/articles.json');
fs.writeFileSync(new URL('content/articles.json', ROOT), JSON.stringify(next, null, 1) + '\n');
try {
  execFileSync('node', ['tools/validate.mjs'], { cwd: ROOT, stdio: 'inherit' });
} catch {
  fs.writeFileSync(new URL('content/articles.json', ROOT), orig);
  console.error('validator failed: articles.json restored to its pre-restore state');
  process.exit(1);
}
console.log('done: article restored to the backed-up version');
