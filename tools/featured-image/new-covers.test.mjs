// node --test tools/featured-image/*.test.mjs — обложки новых статей (без сети).
import test from 'node:test';
import assert from 'node:assert/strict';
import { addedSlugs, hasCover } from './new-covers.mjs';
import { resolveBrief, BRIEFS } from './generate.mjs';

test('only articles added since the base get a cover', () => {
  assert.deepEqual(addedSlugs([{ slug: 'a' }, { slug: 'b' }], [{ slug: 'a' }, { slug: 'b' }, { slug: 'c' }]), ['c']);
});

test('an existing generated file or a covers.ts entry counts as a cover', () => {
  const ts = "  'sales-calendar': { img: sales, alt: ['x', 'y'] },\n  instagram: { img: insta, alt: ['x', 'y'] },";
  const none = () => false;
  assert.equal(hasCover('sales-calendar', ts, none), true);
  assert.equal(hasCover('instagram', ts, none), true);
  assert.equal(hasCover('market-size', ts, none), false);
  assert.equal(hasCover('market-size', ts, (p) => p.endsWith('market-size-featured.webp')), true);
});

test('brief: hand-written, then the writer\'s, then a default — never missing', () => {
  assert.deepEqual(resolveBrief('ai-seo', {}), BRIEFS['ai-seo']);
  const writer = { biome: 'city', gender: 'woman', device: 'phone', action: 'waiting for a train' };
  assert.deepEqual(resolveBrief('new-one', { image_brief: writer }), writer);
  const bad = resolveBrief('new-one', { image_brief: { biome: 'moon', gender: 'robot' } });
  assert.ok(['man', 'woman'].includes(bad.gender) && ['phone', 'laptop'].includes(bad.device) && bad.action);
  assert.deepEqual(resolveBrief('new-one', {}), resolveBrief('new-one', {}), 'default is stable per slug');
});
