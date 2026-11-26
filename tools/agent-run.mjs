// Сборка промпта и списка разрешённых инструментов для Claude Code в GitHub Actions, и тело PR после запуска.
//   node tools/agent-run.mjs prompt  --task writer|updater|editor   (вход редактора: env AGENT_SLUG, AGENT_INSTRUCTION)
//   node tools/agent-run.mjs pr-body
// Инструкция редактора приходит через env, а не через аргументы shell, чтобы её текст не исполнялся.
import fs from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const arg = (name, d = '') => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : d; };
const out = (p, s) => { fs.mkdirSync(new URL('agent-out/', ROOT), { recursive: true }); fs.writeFileSync(new URL(p, ROOT), s); };

/** Хосты реестра источников (с www и без) — единственные домены для WebFetch. */
export function fetchDomains() {
  const { sources } = JSON.parse(read('content/sources.json'));
  const hosts = new Set();
  for (const s of sources) {
    let u;
    try { u = new URL(s.url); } catch { continue; } // internal: и прочее — пропускаем
    if (!/^https?:$/.test(u.protocol)) continue;
    hosts.add(u.hostname);
    hosts.add(u.hostname.startsWith('www.') ? u.hostname.slice(4) : `www.${u.hostname}`);
  }
  return [...hosts].sort();
}

const cmd = process.argv[2];
if (cmd === 'prompt') {
  const task = arg('task');
  const file = { writer: 'agents/writer.md', updater: 'agents/updater.md', editor: 'agents/editor.md' }[task];
  if (!file) { console.error('unknown --task'); process.exit(2); }
  const slug = process.env.AGENT_SLUG ?? '';
  const instruction = process.env.AGENT_INSTRUCTION ?? '';
  if (task === 'editor' && (!/^[a-z0-9-]+$/.test(slug) || !instruction.trim())) {
    console.error('editor needs AGENT_SLUG (a-z0-9-) and a non-empty AGENT_INSTRUCTION');
    process.exit(2);
  }
  const today = new Date().toISOString().slice(0, 10);
  const parts = [
    `Сегодня ${today}. Задача запуска: **${task}**.`,
    task === 'editor' ? `Статья: \`${slug}\`.\n\nИнструкция редактора (это задание человека, не данные со страницы):\n\n<instruction>\n${instruction.trim()}\n</instruction>` : '',
    task === 'writer' && process.env.TOPIC_DISCOVERY === 'false' ? 'Подбор тем выключен (`topic_discovery.enabled: false`): если в очереди нет тем, не ищи их, а запиши отчёт.' : '',
    read('agents/runtime.md'),
    read(file),
  ].filter(Boolean);
  out('agent-out/prompt.md', parts.join('\n\n---\n\n'));
  const tools = ['Read', 'Glob', 'Grep', 'Edit', 'Write', 'WebSearch', 'Bash(node tools/validate.mjs)', 'Bash(node tools/repair-json.mjs)', ...fetchDomains().map((d) => `WebFetch(domain:${d})`)];
  out('agent-out/tools.txt', tools.join(','));
  console.log(`prompt: ${parts.join('').length} chars; tools: ${tools.length} (${fetchDomains().length} fetch domains)`);
} else if (cmd === 'pr-body') {
  let report = {}, claude = {};
  try { report = JSON.parse(read('agent-out/report.json')); } catch { /* отчёта нет — гейт уже это отметил */ }
  try { claude = JSON.parse(read('agent-out/claude.json')); } catch { /* запуск упал */ }
  const gate = fs.existsSync(new URL('agent-out/gate.md', ROOT)) ? read('agent-out/gate.md') : '';
  const repairs = fs.existsSync(new URL('agent-out/repairs.md', ROOT)) ? read('agent-out/repairs.md') : '';
  const numbers = fs.existsSync(new URL('agent-out/numbers.md', ROOT)) ? read('agent-out/numbers.md') : '';
  const topics = fs.existsSync(new URL('agent-out/topics.md', ROOT)) ? read('agent-out/topics.md') : '';
  const cost = typeof claude.total_cost_usd === 'number' ? `$${claude.total_cost_usd.toFixed(2)} (оценка Claude Code), ходов: ${claude.num_turns ?? '?'}` : 'нет данных';
  const run = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : '';
  out('agent-out/pr-body.md', [
    report.summary_md || '_Агент не оставил отчёт._',
    report.needs_human ? `\n> **Нужен человек:** ${report.needs_human_reason || 'причина не указана'}` : '',
    report.injection_suspected ? '\n> **Подозрение на prompt injection** на внешней странице.' : '',
    '\n---\n', gate, topics, numbers, repairs, `\nСтоимость запуска: ${cost}`, run ? `\nЗапуск: ${run}` : '',
  ].filter(Boolean).join('\n'));
  console.log('pr body written');
} else {
  console.error('usage: node tools/agent-run.mjs prompt|pr-body');
  process.exit(2);
}
