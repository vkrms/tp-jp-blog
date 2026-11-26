// node --test tools/*.test.mjs — недельный план агентов (tools/lib/agent-plan.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { jstInfo, weekPlan, tasksFor } from './lib/agent-plan.mjs';

test('JST date and ISO week', () => {
  // 2026-11-26 00:30 UTC = 2026-11-26 09:30 JST, Thursday, ISO week 48
  assert.deepEqual(jstInfo(new Date('2026-11-26T00:30:00Z')), { date: '2026-11-26', isoYear: 2026, isoWeek: 48, isoDay: 4 });
  // Sunday 2026-11-29 16:00 UTC is already Monday 2026-11-30 in Japan (week 49)
  assert.deepEqual(jstInfo(new Date('2026-11-29T16:00:00Z')), { date: '2026-11-30', isoYear: 2026, isoWeek: 49, isoDay: 1 });
  // ISO year boundary: 2027-01-01 (Fri) belongs to 2026-W53
  assert.equal(jstInfo(new Date('2027-01-01T03:00:00Z')).isoWeek, 53);
});

test('every week has 1 or 2 distinct weekdays for EACH task, chosen independently', () => {
  for (let w = 1; w <= 52; w++) {
    const plan = weekPlan(2027, w);
    for (const task of ['writer', 'updater']) {
      const days = plan.filter((s) => s.task === task).map((s) => s.isoDay);
      assert.ok(days.length === 1 || days.length === 2, `${task} w${w}: ${days.length} days`);
      assert.equal(new Set(days).size, days.length, `${task} w${w}: duplicate day`);
      for (const d of days) assert.ok(d >= 1 && d <= 5, `${task} w${w}: weekday ${d} out of Mon-Fri`);
    }
  }
});

test('writer and updater may land on the same day — that is two separate runs, not forbidden', () => {
  let collisions = 0;
  for (let w = 1; w <= 300; w++) {
    const plan = weekPlan(2031, w);
    const writerDays = new Set(plan.filter((s) => s.task === 'writer').map((s) => s.isoDay));
    if (plan.some((s) => s.task === 'updater' && writerDays.has(s.isoDay))) collisions++;
  }
  assert.ok(collisions > 0, 'expected at least one same-day writer+updater collision across 300 weeks');
});

test('plan is deterministic per week and salt', () => {
  assert.deepEqual(weekPlan(2026, 49), weekPlan(2026, 49));
  const differs = Array.from({ length: 20 }, (_, w) => JSON.stringify(weekPlan(2027, w + 1)) !== JSON.stringify(weekPlan(2027, w + 1, 'other'))).some(Boolean);
  assert.ok(differs, 'a different salt reshuffles the plan');
});

test('over a year, 1-slot and 2-slot weeks are both common, for each task independently', () => {
  for (const task of ['writer', 'updater']) {
    const twoSlotWeeks = Array.from({ length: 52 }, (_, w) => weekPlan(2027, w + 1).filter((s) => s.task === task).length === 2).filter(Boolean).length;
    assert.ok(twoSlotWeeks > 13 && twoSlotWeeks < 39, `${task} weeks with 2 slots: ${twoSlotWeeks}/52`);
  }
});

test('a known week (regression anchor): 2026-W48 is Tue updater, Thu writer, Fri updater', () => {
  assert.deepEqual(weekPlan(2026, 48), [
    { isoDay: 2, task: 'updater' },
    { isoDay: 4, task: 'writer' },
    { isoDay: 5, task: 'updater' },
  ]);
});

test('tasksFor returns the day\'s tasks (0, 1 or 2 of them), [] on weekends', () => {
  const sat = new Date('2026-11-28T03:00:00Z'); // Saturday in JST
  assert.deepEqual(tasksFor(sat), []);

  const thu = new Date('2026-11-26T00:30:00Z'); // Thu 2026-11-26 JST, W48 — writer per the anchor above
  assert.deepEqual(tasksFor(thu), ['writer']);
});

test('tasksFor agrees with weekPlan for every day of a week that has a same-day collision', () => {
  // 2031-W?? collision week found in the earlier test; just re-derive one directly here for a same-day check.
  let collisionWeek = null;
  for (let w = 1; w <= 300; w++) {
    const plan = weekPlan(2031, w);
    const writerDays = new Set(plan.filter((s) => s.task === 'writer').map((s) => s.isoDay));
    const day = plan.find((s) => s.task === 'updater' && writerDays.has(s.isoDay))?.isoDay;
    if (day) { collisionWeek = { w, day }; break; }
  }
  assert.ok(collisionWeek, 'setup: expected a collision week to exist');
  // Build a JST-midday Date for isoDay `day` of ISO week `w` in 2031 and check tasksFor returns both tasks.
  const jan4 = new Date(Date.UTC(2031, 0, 4)); // always in week 1
  const monday1 = new Date(jan4.getTime() - ((jan4.getUTCDay() || 7) - 1) * 86400_000);
  const target = new Date(monday1.getTime() + ((collisionWeek.w - 1) * 7 + (collisionWeek.day - 1)) * 86400_000 + 12 * 3600_000 - 9 * 3600_000);
  assert.deepEqual(new Set(tasksFor(target)), new Set(['writer', 'updater']));
});
