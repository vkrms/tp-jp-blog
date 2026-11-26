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

test('caption is required for data figures, alt is not', () => {
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

test('raster figures need alt + brief and take no data', () => {
  const photo = { kind: 'photo', template: 'check-cards', alt: ['空港', 'Airport'], brief: { biome: 'city', gender: 'woman' } };
  // a raster kind still has to match an existing template's kind, which is a data template
  assert.match(errs(photo), /kind/);
  const good = { kind: 'photo', template: 'photo-scene', alt: ['空港', 'Airport'], brief: { biome: 'city', gender: 'woman' } };
  // unknown template is reported, but alt/brief rules still hold for a raster kind
  assert.match(errs(good), /шаблона «photo-scene» нет/);
  assert.match(errs({ kind: 'photo', alt: ['空港', 'Airport'] }), /нужен brief/);
  assert.match(errs({ kind: 'photo', brief: { biome: 'city' } }), /нужен alt/);
});

test('text pair helper accepts both content forms', () => {
  assert.equal(isText(['ja', 'en']), true);
  assert.equal(isText({ ja: 'ja', en: 'en' }), true);
  assert.equal(isText(['ja', '']), false);
  assert.equal(isText(['ja only']), false);
  assert.equal(isText('ja'), false);
  assert.equal(isText(null), false);
});

test('manifest: every template declares a known kind, a caption policy and data fields', () => {
  for (const [id, t] of Object.entries(manifest.templates)) {
    assert.ok(Object.keys(manifest.kinds).includes(t.kind), `${id}: unknown kind ${t.kind}`);
    if ((manifest.raster_kinds ?? []).includes(t.kind)) assert.equal(t.data, undefined, `${id}: raster template must not declare data`);
    else assert.ok(t.data && Object.keys(t.data).length > 0, `${id}: data spec is empty`);
    if (t.caption) assert.equal(t.caption, 'required');
  }
});
