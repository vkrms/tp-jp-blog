// node --test tools/*.test.mjs — ремонт типографских кавычек в JSON (tools/lib/repair-json.mjs).
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

test('real failure: curly key and curly value delimiters on their own pretty-printed lines', () => {
  const t = [
    '{',
    ' “answer_first”: {',
    '  “ja”: “セールは**今週末**まで。”,',
    '  “en”: “The sale runs until **this weekend**.”',
    ' }',
    '}',
  ].join('\n');
  const r = repairJsonText(t);
  assert.equal(r.ok, true);
  const parsed = JSON.parse(r.text);
  assert.equal(parsed.answer_first.ja, 'セールは**今週末**まで。');
  assert.equal(parsed.answer_first.en, 'The sale runs until **this weekend**.');
});

test('a quotation mark at the very edge of a value is NOT mistaken for a broken delimiter (false positive from the first heuristic)', () => {
  // "...say “you can’t earn”, but the survey..." — a real quotation whose closing curly quote sits right
  // before a comma, exactly where a broken delimiter would also sit. The line is already valid ASCII-quoted
  // JSON throughout, so nothing here should ever be touched, regardless of base/changed-line status.
  const t = '{\n "en": "many say “you can’t earn”, but the survey disagrees."\n}';
  assert.deepEqual(repairJsonText(t), { text: t, fixed: 0, ok: true });
});

test('base-line exemption: a byte-identical pre-existing line keeps its curly quotes even if broken-looking elsewhere forces a repair pass', () => {
  const untouchedLine = ' "en": "many say “you can’t earn”, but the survey disagrees."';
  const base = `{\n${untouchedLine}\n}`;
  const broken = `{\n${untouchedLine},\n “ja”: “セールは今週末まで。”\n}`; // a genuinely new, broken second field
  const r = repairJsonText(broken, base);
  assert.equal(r.ok, true);
  assert.ok(r.text.includes(untouchedLine), 'the pre-existing line is byte-identical, untouched');
  assert.equal(JSON.parse(r.text).ja, 'セールは今週末まで。');
});

test('an internal quotation on a brand-new line survives even though the line itself is fixed (the real PR #6 case)', () => {
  // The line's own value delimiters (first/last char) are already straight ASCII; only an unrelated
  // adjacent line (sharing the repair pass) is actually broken. Internal “until…”/“when…” must survive.
  const base = '{}';
  const broken = [
    '{',
    ' “p”: [',
    '  “次は表です。”,',
    '  "The table separates “until when you can buy” from “when you can travel”."',
    ' ]',
    '}',
  ].join('\n');
  const r = repairJsonText(broken, base);
  assert.equal(r.ok, true);
  const parsed = JSON.parse(r.text);
  assert.equal(parsed.p[0], '次は表です。');
  assert.equal(parsed.p[1], 'The table separates “until when you can buy” from “when you can travel”.');
});

test('without a baseText (e.g. a brand-new agent-out/report.json), every line is eligible', () => {
  const t = '{\n “title”: “新しい記事”\n}';
  const r = repairJsonText(t, null);
  assert.equal(r.ok, true);
  assert.equal(JSON.parse(r.text).title, '新しい記事');
});
