// node --test tools/*.test.mjs — ремонт типографских кавычек у ключей JSON (tools/lib/repair-json.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import { repairJsonText } from './lib/repair-json.mjs';

test('valid JSON is left alone, including curly quotes inside text', () => {
  const t = '{"p": ["彼は“こんにちは”と言った", "He said “hi”, then left"]}';
  assert.deepEqual(repairJsonText(t), { text: t, fixed: 0, ok: true });
});

test('curly-quoted keys are repaired (the updater rehearsal failure)', () => {
  const t = '{\n "slug": "x",\n “answer_first”: {"ja": "a", "en": "b"},\n “rows”: [["“引用”", "q"]]\n}';
  const r = repairJsonText(t);
  assert.equal(r.ok, true);
  assert.equal(r.fixed, 2);
  assert.deepEqual(JSON.parse(r.text).rows, [['“引用”', 'q']], 'quotes inside values survive');
});

test('JSON that stays broken is returned unchanged', () => {
  const t = '{"a": “not a key but a value”}';
  assert.deepEqual(repairJsonText(t), { text: t, fixed: 0, ok: false });
});
