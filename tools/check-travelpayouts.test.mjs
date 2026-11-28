// node --test tools/*.test.mjs — проверка утверждений о Travelpayouts по одобренным фактам
// (tools/lib/check-travelpayouts.mjs), без сети.
import test from 'node:test';
import assert from 'node:assert/strict';
import { tpSentences, changedTpSentences, buildMessages, parseFindings, holdReasons } from './lib/check-travelpayouts.mjs';

const art = (slug, ps) => ({ slug, title: ['t', 't'], eyebrow: ['e', 'e'], answer_first: ['a', 'a'], sections: [{ h: ['h', 'h'], b: ps.map((p) => ({ p })) }], faq: [], matome: [] });

test('tpSentences splits text into sentences and keeps only ones mentioning Travelpayouts', () => {
  const a = art('x', [['Travelpayoutsは良いサービスです。別の文です。', 'Travelpayouts is a good service. Another sentence.']]);
  assert.deepEqual(tpSentences(a), ['Travelpayoutsは良いサービスです。', 'Travelpayouts is a good service.']);
});

test('only new or changed TP-mentioning sentences are reviewed, per article', () => {
  const base = [art('x', [['Travelpayoutsは良いサービスです。', 'Travelpayouts is a good service.']])];
  const next = [
    art('x', [['Travelpayoutsは良いサービスです。', 'Travelpayouts is a good service.'], ['Travelpayoutsは新機能があります。', 'Travelpayouts has a new feature.']]),
    art('y', [['Travelpayoutsとは何か。', 'What is Travelpayouts.']]),
  ];
  assert.deepEqual(changedTpSentences(base, next).map((i) => `${i.slug}:${i.text}`), [
    'x:Travelpayoutsは新機能があります。', 'x:Travelpayouts has a new feature.',
    'y:Travelpayoutsとは何か。', 'y:What is Travelpayouts.',
  ]);
});

test('the prompt carries the approved facts text and extra notes, and explains the "not verbatim" intent', () => {
  const [system] = buildMessages([{ slug: 'x', text: 't' }], { rulesText: '11 travel verticals; Support 24/7', notes: ['не называть конкурентов'] });
  const flat = system.content.replace(/\s+/g, ' ');
  assert.match(flat, /11 travel verticals/);
  assert.match(flat, /не называть конкурентов/);
  assert.match(flat, /not against whether this exact sentence has been published before/i);
});

test('findings are parsed and hold the PR; nothing found, no items, or no check at all does not', () => {
  const findings = parseFindings('```json\n{"findings":[{"slug":"y","evidence":"無料ブログでも使えます","reason":"not among the approved facts"}]}\n```');
  assert.equal(holdReasons({ items: 2, findings }).length, 1);
  assert.deepEqual(holdReasons({ items: 2, findings: [] }), []);
  assert.deepEqual(holdReasons({ items: 0 }), []);
  assert.deepEqual(holdReasons(null), []);
  assert.equal(holdReasons({ items: 1, error: 'timeout' }).length, 1, 'a failed check with new TP text holds');
});
