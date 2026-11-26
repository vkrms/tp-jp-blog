// Недельный план запусков агентов: каждую неделю 1–2 запуска писателя (writer) И, независимо, 1–2 запуска
// updater. Дни для каждой задачи выбираются отдельно, поэтому иногда оба запуска выпадают на один
// день (тогда это два отдельных запуска за день — concurrency-группа agent-content в agent.yml сама их очередит).
// План детерминирован по номеру недели (ISO, время Японии): повторный запуск в тот же день даёт тот же ответ.

const TZ_OFFSET_H = 9; // Asia/Tokyo, без летнего времени
export const TASKS = ['writer', 'updater'];
const WEEKDAYS = [1, 2, 3, 4, 5]; // пн–пт (ISO: 1 = понедельник)

/** Дата в Японии: { date: 'YYYY-MM-DD', isoYear, isoWeek, isoDay } */
export function jstInfo(now = new Date()) {
  const t = new Date(now.getTime() + TZ_OFFSET_H * 3600_000); // поля UTC этой даты = время в Японии
  const date = t.toISOString().slice(0, 10);
  const isoDay = t.getUTCDay() || 7;
  const thursday = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate() + 4 - isoDay));
  const isoYear = thursday.getUTCFullYear();
  const isoWeek = Math.ceil(((thursday - Date.UTC(isoYear, 0, 1)) / 86400000 + 1) / 7);
  return { date, isoYear, isoWeek, isoDay };
}

/** Детерминированный генератор случайных чисел от строки (FNV-1a → mulberry32). */
function rng(seedText) {
  let h = 2166136261;
  for (const c of seedText) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** n (1 либо 2, решает сам) различных случайных будних дней. */
function pickDays(r) {
  const n = r() < 0.5 ? 1 : 2;
  const pool = [...WEEKDAYS];
  const days = [];
  for (let i = 0; i < n; i++) days.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
  return days;
}

/**
 * План недели: [{ isoDay, task }], по возрастанию дня. Писатель и updater получают дни независимо друг от
 * друга (каждому — 1 или 2 своих дня); один день может достаться обоим сразу.
 */
export function weekPlan(isoYear, isoWeek, salt = '') {
  const r = rng(`${isoYear}-W${isoWeek}:${salt}`);
  const plan = [];
  for (const task of TASKS) {
    for (const isoDay of pickDays(r)) plan.push({ isoDay, task });
  }
  return plan.sort((a, b) => a.isoDay - b.isoDay || TASKS.indexOf(a.task) - TASKS.indexOf(b.task));
}

/** Задачи на сегодня (время Японии): [] | ['writer'] | ['updater'] | ['writer', 'updater']. */
export function tasksFor(now = new Date(), salt = '') {
  const { isoYear, isoWeek, isoDay } = jstInfo(now);
  return weekPlan(isoYear, isoWeek, salt).filter((s) => s.isoDay === isoDay).map((s) => s.task);
}
