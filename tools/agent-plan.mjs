// План запусков агентов (tools/lib/agent-plan.mjs).
//   node tools/agent-plan.mjs            план на эту и 3 следующие недели
//   node tools/agent-plan.mjs --today    задача на сегодня (writer | updater | none); пишет task=… в $GITHUB_OUTPUT
// Соль плана: env AGENT_PLAN_SALT (переменная репозитория), чтобы при желании «перетасовать» расписание.
import fs from 'node:fs';
import { jstInfo, weekPlan, taskFor } from './lib/agent-plan.mjs';

const salt = process.env.AGENT_PLAN_SALT ?? '';
const DAY = ['', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

if (process.argv.includes('--today')) {
  const { date } = jstInfo();
  const task = taskFor(new Date(), salt) ?? 'none';
  console.log(`${date} (JST): ${task}`);
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `task=${task}\n`);
} else {
  for (let w = 0; w < 4; w++) {
    const { isoYear, isoWeek } = jstInfo(new Date(Date.now() + w * 7 * 86400000));
    const plan = weekPlan(isoYear, isoWeek, salt);
    console.log(`${isoYear}-W${String(isoWeek).padStart(2, '0')}: ${plan.map((s) => `${DAY[s.isoDay]} ${s.task}`).join(', ')}`);
  }
}
