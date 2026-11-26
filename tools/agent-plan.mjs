// План запусков агентов (tools/lib/agent-plan.mjs).
//   node tools/agent-plan.mjs            план на эту и 7 следующих недель
//   node tools/agent-plan.mjs --today    задачи на сегодня (JSON-массив: [] | ["writer"] | ["updater"] | ["writer","updater"])
//                                        пишет tasks=<json> в $GITHUB_OUTPUT
// Соль плана: env AGENT_PLAN_SALT (переменная репозитория), чтобы при желании «перетасовать» расписание.
import fs from 'node:fs';
import { jstInfo, weekPlan, tasksFor } from './lib/agent-plan.mjs';

const salt = process.env.AGENT_PLAN_SALT ?? '';
const DAY = ['', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

if (process.argv.includes('--today')) {
  const { date } = jstInfo();
  const tasks = tasksFor(new Date(), salt);
  console.log(`${date} (JST): ${tasks.length ? tasks.join(' + ') : 'none'}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `tasks=${JSON.stringify(tasks)}\n`);
} else {
  for (let w = 0; w < 8; w++) {
    const { isoYear, isoWeek } = jstInfo(new Date(Date.now() + w * 7 * 86400000));
    const plan = weekPlan(isoYear, isoWeek, salt);
    const byDay = new Map();
    for (const s of plan) byDay.set(s.isoDay, [...(byDay.get(s.isoDay) ?? []), s.task]);
    const parts = [...byDay.entries()].sort((a, b) => a[0] - b[0]).map(([d, tasks]) => `${DAY[d]} ${tasks.join('+')}`);
    console.log(`${isoYear}-W${String(isoWeek).padStart(2, '0')}: ${parts.join(', ')}`);
  }
}
