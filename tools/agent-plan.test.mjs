// node --test tools/*.test.mjs — недельный план агентов (tools/lib/agent-plan.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { jstInfo, weekPlan, taskFor } from './lib/agent-plan.mjs';

test('JST date and ISO week', () => {
  // 2026-11-26 00:30 UTC = 2026-11-26 09:30 JST, Thursday, ISO week 48
  assert.deepEqual(jstInfo(new Date('2026-11-26T00:30:00Z')), { date: '2026-11-26', isoYear: 2026, isoWeek: 48, isoDay: 4 });
  // Sunday 2026-11-29 16:00 UTC is already Monday 2026-11-30 in Japan (week 49)
  assert.deepEqual(jstInfo(new Date('2026-11-29T16:00:00Z')), { date: '2026-11-30', isoYear: 2026, isoWeek: 49, isoDay: 1 });
  // ISO year boundary: 2027-01-01 (Fri) belongs to 2026-W53
  assert.equal(jstInfo(new Date('2027-01-01T03:00:00Z')).isoWeek, 53);
});

test('every week has 1 or 2 slots on distinct weekdays, writer or updater', () => {
  for (let w = 1; w <= 52; w++) {
    const plan = weekPlan(2027, w);
    assert.ok(plan.length === 1 || plan.length === 2);
    assert.equal(new Set(plan.map((s) => s.isoDay)).size, plan.length);
    for (const s of plan) {
      assert.ok(s.isoDay >= 1 && s.isoDay <= 5);
      assert.ok(['writer', 'updater'].includes(s.task));
    }
  }
});

test('plan is deterministic per week and salt', () => {
  assert.deepEqual(weekPlan(2026, 49), weekPlan(2026, 49));
  const differs = Array.from({ length: 20 }, (_, w) => JSON.stringify(weekPlan(2027, w + 1)) !== JSON.stringify(weekPlan(2027, w + 1, 'other'))).some(Boolean);
  assert.ok(differs, 'a different salt reshuffles the plan');
});

test('over a year the mix is roughly balanced', () => {
  const all = Array.from({ length: 52 }, (_, w) => weekPlan(2027, w + 1)).flat();
  const two = Array.from({ length: 52 }, (_, w) => weekPlan(2027, w + 1).length === 2).filter(Boolean).length;
  const writers = all.filter((s) => s.task === 'writer').length;
  assert.ok(two > 13 && two < 39, `weeks with 2 slots: ${two}`);
  assert.ok(writers > all.length * 0.3 && writers < all.length * 0.7, `writer share: ${writers}/${all.length}`);
});

test('taskFor returns the slot of the day or null on weekends', () => {
  const sat = new Date('2026-11-28T03:00:00Z');
  assert.equal(taskFor(sat), null);
});
