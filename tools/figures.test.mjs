// node --test tools/*.test.mjs — схема фигур в статье (tools/lib/figures.mjs, docs/figures.md).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateFigure, manifestUrl, isText } from './lib/figures.mjs';

const manifest = JSON.parse(fs.readFileSync(manifestUrl, 'utf8'));
const ok = (figure) => assert.deepEqual(validateFigure(figure, manifest), []);
const errs = (figure) => validateFigure(figure, manifest).join(' | ');

const cards = {
  kind: 'infographic',
  template: 'check-cards',
  caption: ['タイミングごとの確認事項', 'What to check at each stage'],
  data: {
    items: [
      { label: ['公開前', 'Before publishing'], body: ['期間と条件を読む', 'Read the period and conditions'], source: ['TRAICY', 'TRAICY'] },
      { label: ['期限の翌日', 'Day after the deadline'], body: ['「終了」に更新する', 'Mark it “ended”'] },
    ],
  },
};

test('valid data figure', () => {
  ok(cards);
  ok({ kind: 'schematic', template: 'steps-arrow', caption: ['4ステップ', 'Four steps'], data: { items: [{ title: ['書く', 'Write'] }, { title: ['更新する', 'Update'] }] } });
  ok({ kind: 'infographic', template: 'compare-pairs', caption: ['書き方', 'How to write'], data: { pairs: [{ avoid: ['11月9日まで', 'until 9 Nov'], prefer: ['11月9日 16:59まで', 'until 9 Nov, 16:59'] }] } });
});

test('optional source may be omitted, but a stray key is an error', () => {
  ok(cards);
  assert.match(errs({ ...cards, data: { items: [{ label: ['a', 'a'], body: ['b', 'b'], src: ['c', 'c'] }] } }), /лишнее поле data\.items\[0\]\.src/);
});

test('unknown template or mismatched kind', () => {
  assert.match(errs({ ...cards, template: 'nope' }), /шаблона «nope» нет/);
  assert.match(errs({ ...cards, kind: 'schematic' }), /kind «infographic»/);
  assert.match(errs({ ...cards, kind: 'poster' }), /kind «poster» не из списка/);
});

test('unknown field in the block', () => {
  assert.match(errs({ ...cards, src: 'images/x.jpg' }), /неизвестное поле «src»/);
});

test('caption is required for these templates', () => {
  const { caption, ...noCaption } = cards;
  assert.match(errs(noCaption), /нужен caption/);
  assert.match(errs({ ...cards, caption: ['только ja', ''] }), /caption должен быть парой ja\/en/);
  ok({ ...cards, caption: { ja: '確認事項', en: 'What to check' } });
});

test('data must match the template: presence, type, min/max', () => {
  assert.match(errs({ ...cards, data: {} }), /нет data\.items/);
  assert.match(errs({ ...cards, data: { items: [{ label: ['a', 'a'] }] } }), /нет data\.items\[\]\.body/);
  assert.match(errs({ ...cards, data: { items: [{ label: 'not a pair', body: ['b', 'b'] }] } }), /неверный тип/);
  assert.match(errs({ ...cards, data: { items: [{ label: ['a', 'a'], body: ['b', 'b'] }] } }), /минимум 2/);
  const many = { items: Array.from({ length: 6 }, () => ({ label: ['a', 'a'], body: ['b', 'b'] })) };
  assert.match(errs({ ...cards, data: many }), /максимум 5/);
  assert.match(errs({ ...cards, data: { items: 'x' } }), /неверный тип/);
});

test('raster and planned kinds are rejected with a clear message', () => {
  assert.match(errs({ kind: 'photo', template: 'check-cards', alt: ['空港', 'Airport'], brief: {} }), /пока не поддерживается/);
  assert.match(errs({ kind: 'composite', template: 'check-cards', data: {} }), /пока не поддерживается/);
  assert.match(errs({ kind: 'poster', template: 'check-cards', data: {} }), /не из списка/);
  // unsupported fields are rejected outright, not silently ignored
  assert.match(errs({ ...cards, alt: ['空港', 'Airport'] }), /неизвестное поле «alt»/);
  assert.match(errs({ ...cards, brief: {} }), /неизвестное поле «brief»/);
});

test('text pair helper accepts both content forms', () => {
  assert.equal(isText(['ja', 'en']), true);
  assert.equal(isText({ ja: 'ja', en: 'en' }), true);
  assert.equal(isText(['ja', '']), false);
  assert.equal(isText(['ja only']), false);
  assert.equal(isText('ja'), false);
  assert.equal(isText(null), false);
});

test('timeline-gantt: ranges, optional fields and the ordering rule', () => {
  const gantt = {
    kind: 'infographic',
    template: 'timeline-gantt',
    caption: ['年末までの予定', 'The schedule to year-end'],
    data: {
      rows: [
        { label: ['ふるさと納税', 'Furusato Nozei'], from: '2026-10-21', to: '2026-12-02' },
        { label: ['ブラックフライデー', 'Black Friday'], from: '2026-11-27', to: '2026-11-27', when: ['11/27（金）', 'Fri 27 Nov'] },
        { label: ['ANAとIHG', 'ANA and IHG'], from: '2027-01-01', note: ['一部は2月から', 'partly Feb'] },
      ],
      note: ['早めに準備する', 'Prepare early'],
    },
  };
  ok(gantt);
  assert.match(errs({ ...gantt, data: { ...gantt.data, note: ['только ja', ''] } }), /caption|note/);
  assert.match(errs({ ...gantt, data: { rows: [{ label: ['a', 'b'], from: '2026-12-02', to: '2026-10-21' }, gantt.data.rows[0]] } }), /раньше/);
  assert.match(errs({ ...gantt, data: { rows: [{ label: ['a', 'b'], from: '2026-10-21' }] } }), /минимум 2/);
  assert.match(errs({ ...gantt, data: { rows: [{ label: ['a', 'b'], from: '21.10.2026' }, gantt.data.rows[0]] } }), /неверный тип/);
  assert.match(errs({ ...gantt, data: { rows: [{ label: ['a', 'b'], from: '2026-10-21', from_to: 'x' }, gantt.data.rows[0]] } }), /лишнее поле/);
});

test('examples in tools/figures/examples.json stay valid', () => {
  const file = JSON.parse(fs.readFileSync(new URL('./figures/examples.json', import.meta.url), 'utf8'));
  assert.ok(file.examples.length >= 3, 'keep a few examples for every template');
  for (const e of file.examples) {
    assert.ok(e.name, 'every example is named');
    assert.deepEqual(validateFigure(e.figure, manifest), [], e.name);
  }
});

test('manifest: kinds and templates cannot drift apart', () => {
  const produced = new Set(Object.values(manifest.templates).map((t) => t.kind));
  assert.deepEqual([...produced].sort(), Object.keys(manifest.kinds).sort(), 'kinds must be exactly the kinds some template produces');
  for (const [id, t] of Object.entries(manifest.templates)) {
    assert.ok(t.data && Object.keys(t.data).length > 0, `${id}: data spec is empty`);
    if (t.caption) assert.equal(t.caption, 'required');
  }
  for (const id of Object.keys(manifest.planned_kinds ?? {})) {
    assert.ok(!(id in manifest.kinds), `${id}: a planned kind must not also be validatable`);
  }
});
