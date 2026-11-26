// node --test tools/*.test.mjs — смысловая проверка исключённых тем (tools/lib/check-topics.mjs), без сети.
import test from 'node:test';
import assert from 'node:assert/strict';
import { changedText, buildMessages, parseFindings, holdReasons } from './lib/check-topics.mjs';

const art = (slug, ps) => ({ slug, title: ['t', 't'], eyebrow: ['e', 'e'], answer_first: ['a', 'a'], sections: [{ h: ['h', 'h'], b: ps.map((p) => ({ p })) }], faq: [], matome: [] });

test('only new or changed text of articles is reviewed', () => {
  const base = [art('x', [['古い文', 'old']])];
  const next = [art('x', [['古い文', 'old'], ['新しい文', 'new']]), art('y', [['別の記事', 'other']])];
  assert.deepEqual(changedText(base, next).map((i) => `${i.slug}:${i.text}`), ['x:新しい文', 'x:new', 'y:t', 'y:e', 'y:a', 'y:h', 'y:別の記事', 'y:other']);
});

test('the prompt carries the owner excluded topics', () => {
  const [system] = buildMessages([{ slug: 'x', text: 't' }], { topics: ['право и маркировка рекламы'], description: 'решение владельца' });
  assert.match(system.content, /право и маркировка рекламы/);
  assert.match(system.content, /PR表示/);
});

test('findings are parsed and hold the PR; nothing found or no text does not', () => {
  const findings = parseFindings('```json\n{"findings":[{"slug":"y","topic":"law_ads","evidence":"表示が義務","reason":"labelling duty"}]}\n```');
  assert.equal(holdReasons({ items: 3, findings }).length, 1);
  assert.deepEqual(holdReasons({ items: 3, findings: [] }), []);
  assert.deepEqual(holdReasons({ items: 0 }), []);
  assert.equal(holdReasons({ items: 2, error: 'timeout' }).length, 1, 'a failed check with new text holds');
});
