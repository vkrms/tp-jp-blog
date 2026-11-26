// Недельный план запусков агентов: каждую неделю 1 или 2 слота в случайные будни, каждый слот — статья (writer)
// или обновление (updater), тоже случайно. План детерминирован по номеру недели (ISO, время Японии):
// повторный запуск в тот же день даёт тот же ответ, план можно посмотреть заранее.

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

/** План недели: [{ isoDay, task }], по возрастанию дня. */
export function weekPlan(isoYear, isoWeek, salt = '') {
  const r = rng(`${isoYear}-W${isoWeek}:${salt}`);
  const slots = r() < 0.5 ? 1 : 2;
  const days = [...WEEKDAYS];
  const plan = [];
  for (let i = 0; i < slots; i++) {
    const day = days.splice(Math.floor(r() * days.length), 1)[0];
    plan.push({ isoDay: day, task: TASKS[Math.floor(r() * TASKS.length)] });
  }
  return plan.sort((x, y) => x.isoDay - y.isoDay);
}

/** Задача на сегодня (время Японии) или null. */
export function taskFor(now = new Date(), salt = '') {
  const { isoYear, isoWeek, isoDay } = jstInfo(now);
  return weekPlan(isoYear, isoWeek, salt).find((s) => s.isoDay === isoDay)?.task ?? null;
}
