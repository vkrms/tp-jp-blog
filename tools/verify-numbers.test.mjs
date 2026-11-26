// node --test tools/*.test.mjs — автосверка цифр (tools/lib/verify-numbers.mjs), без сети.
import test from 'node:test';
import assert from 'node:assert/strict';
import { changedFigures, sourceUrls, htmlToText, parseResults, holdReasons, isRealMismatch } from './lib/verify-numbers.mjs';

const art = (slug, paragraphs, extra = {}) => ({ slug, title: ['t', 't'], eyebrow: ['e', 'e'], answer_first: ['a', 'a'],
  sections: [{ h: ['h', 'h'], b: paragraphs.map((p) => ({ p })) }], faq: [], matome: [], sources: [], ...extra });

test('only new or changed strings with digits are checked', () => {
  const base = [art('x', [['2026年9月は148万人', 'Sep: 1.48m'], ['変わらない文', 'unchanged']])];
  const next = [art('x', [['2026年10月は127万人', 'Oct: 1.27m'], ['変わらない文', 'unchanged'], ['数字なし', 'no digits']])];
  assert.deepEqual(changedFigures(base, next).map((f) => f.text), ['2026年10月は127万人', 'Oct: 1.27m']);
});

test('source urls: links in changed text first, registry hosts only', () => {
  const sources = [{ id: 'tv', url: 'https://www.travelvoice.jp/x' }, { id: 'int', url: 'internal: TP' }];
  const next = [art('x', [['[JNTO](https://www.travelvoice.jp/20261118-160890)によると127万人', 'x'], ['[evil](https://evil.example/p)で3人', 'y']], { sources: ['tv'] })];
  const figs = changedFigures([], next);
  assert.deepEqual(sourceUrls(figs, next, sources), ['https://www.travelvoice.jp/20261118-160890', 'https://www.travelvoice.jp/x']);
});

test('html to text drops scripts and tags', () => {
  assert.equal(htmlToText('<script>x()</script><p>127万1800人&nbsp;です</p><style>p{}</style>'), '127万1800人 です');
});

test('model answers are parsed, also inside ```json fences', () => {
  assert.equal(parseResults('```json\n{"results":[{"id":0,"status":"ok"}]}\n```').length, 1);
  assert.throws(() => parseResults('{"nope":1}'));
});

test('only numeric mismatches hold; equal values in other formats are false alarms', () => {
  assert.equal(isRealMismatch({ status: 'mismatch', article_value: 1663710, source_value: 1663474 }), true);
  assert.equal(isRealMismatch({ status: 'mismatch', article_value: 3912500, source_value: 3912500 }), false);
  assert.equal(isRealMismatch({ status: 'mismatch', article_value: null, source_value: 5 }), false);
  const check = { statements: 3, results: [
    { status: 'mismatch', figure: '1,663,710', article_value: 1663710, source_value: 1663474, source_says: '166万3474人' },
    { status: 'mismatch', figure: '3,912,500', article_value: 3912500, source_value: 3912500 },
    { status: 'unverifiable', figure: '36%' },
  ] };
  assert.equal(holdReasons(check).length, 1);
});

test('no figures → nothing to hold; verifier error with figures → hold', () => {
  assert.deepEqual(holdReasons({ statements: 0 }), []);
  assert.equal(holdReasons({ statements: 2, error: 'timeout' }).length, 1);
});
