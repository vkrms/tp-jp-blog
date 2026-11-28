// CLI вокруг tools/lib/agent-gate.mjs для GitHub Actions (.github/workflows/agent.yml).
//   node tools/agent-gate.mjs pre  --task writer
//   node tools/agent-gate.mjs post --task editor --slug ai-seo --base <sha>
// Пишет решение в $GITHUB_OUTPUT (если есть) и в agent-out/gate.md; код выхода 0, кроме сбоев самого скрипта.
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { parsePolicy, preCheck, postCheck } from './lib/agent-gate.mjs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (name, d = '') => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' });

const mode = process.argv[2];
const task = arg('task');
if (!['pre', 'post'].includes(mode) || !['writer', 'updater', 'editor'].includes(task)) {
  console.error('usage: node tools/agent-gate.mjs pre|post --task writer|updater|editor [--slug s] [--base sha]');
  process.exit(2);
}

const output = (pairs) => {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(pairs).map(([k, v]) => `${k}=${v}\n`).join(''));
};
const policy = parsePolicy(read('content/policy.yaml'));
let articles = null;
let articlesError = '';
try { articles = JSON.parse(read('content/articles.json')); } catch (e) { articlesError = e.message; }
if (mode === 'pre' && !articles) { console.error(`content/articles.json не разбирается: ${articlesError}`); process.exit(1); }

if (mode === 'pre') {
  const queue = JSON.parse(read('content/queue.json')).queue;
  const r = preCheck({ task, policy, articles, queue });
  console.log(r.run ? `pre-check: ok (${task})` : `pre-check: skip — ${r.reason}`);
  output({ run: r.run, reason: r.reason ?? '', topic_discovery: policy.topic_discovery });
  process.exit(0);
}

// post
const base = arg('base') || git('rev-parse', 'HEAD').trim();
const untrackedFiles = git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
const changedFiles = [...new Set([...git('diff', '--name-only', base).split('\n'), ...untrackedFiles].filter(Boolean))];
const baseArticles = JSON.parse(git('show', `${base}:content/articles.json`));
const validator = spawnSync('node', ['tools/validate.mjs'], { cwd: ROOT, encoding: 'utf8' });
let report = null;
try { report = JSON.parse(read('agent-out/report.json')); } catch { /* нет отчёта → hold */ }
let numberCheck = null;
try { numberCheck = JSON.parse(read('agent-out/numbers.json')); } catch { /* сверка не запускалась */ }
let topicCheck = null;
try { topicCheck = JSON.parse(read('agent-out/topics.json')); } catch { /* проверка тем не запускалась */ }
let tpCheck = null;
try { tpCheck = JSON.parse(read('agent-out/travelpayouts.json')); } catch { /* проверка Travelpayouts не запускалась */ }

// Сломанный JSON (агент испортил файл и ремонт не помог) — это отказ, а не падение скрипта.
const brokenJson = ['content/articles.json', 'content/queue.json', 'content/sources.json', 'content/glossary.json']
  .filter((f) => changedFiles.includes(f))
  .filter((f) => { try { JSON.parse(read(f)); return false; } catch { return true; } });
const r = brokenJson.length
  ? { decision: 'reject', reasons: brokenJson.map((f) => `${f}: не разбирается как JSON (см. agent-out/repairs.md)`), summary: {} }
  : postCheck({ task, slug: arg('slug'), policy, baseArticles, newArticles: articles, changedFiles, untrackedFiles, validatorOk: validator.status === 0, report, numberCheck, topicCheck, tpCheck });

const md = [
  `### Gate: **${r.decision}**`,
  r.reasons.length ? r.reasons.map((x) => `- ${x}`).join('\n') : '- все проверки пройдены',
  r.summary.added?.length ? `\nНовые статьи: ${r.summary.added.join(', ')}` : '',
  r.summary.changed?.length ? `Изменённые статьи: ${r.summary.changed.join(', ')}` : '',
  '\n<details><summary>Валидатор</summary>\n\n```\n' + (validator.stdout + validator.stderr).trim() + '\n```\n</details>',
].filter(Boolean).join('\n');
fs.mkdirSync(new URL('agent-out/', ROOT), { recursive: true });
fs.writeFileSync(new URL('agent-out/gate.md', ROOT), md + '\n');
console.log(md);
output({ decision: r.decision, title: (report?.title || '').replace(/\n/g, ' ').slice(0, 120) });
