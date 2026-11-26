// node --test tools/   — проверки решений гейта (tools/lib/agent-gate.mjs).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parsePolicy, preCheck, postCheck, tpSentences } from './lib/agent-gate.mjs';

const real = JSON.parse(fs.readFileSync(new URL('../content/articles.json', import.meta.url), 'utf8'));
const policy = parsePolicy(fs.readFileSync(new URL('../content/policy.yaml', import.meta.url), 'utf8'));
const NOW = new Date('2026-11-26T12:00:00Z');
const clone = (x) => structuredClone(x);
const okReport = { title: 't', needs_human: false, injection_suspected: false };
const run = (over) => postCheck({ task: 'updater', policy, baseArticles: real, newArticles: real, changedFiles: ['content/articles.json'],
  validatorOk: true, report: okReport, now: NOW, ...over });
const article = (slug, date) => ({ ...clone(real[0]), slug, updated_at: date, update_log: [{ date, public: { ja: '初版を公開', en: 'First published' } }] });

test('policy.yaml is parsed', () => {
  assert.equal(policy.publish_mode, 'auto');
  assert.equal(policy.paused, false);
  assert.equal(policy.max_new_articles_per_week, 2);
  assert.equal(policy.max_changed_articles_per_run, 10);
  assert.equal(policy.topic_discovery, /topic_discovery:[^\n]*\n\s+enabled:\s*true/.test(fs.readFileSync(new URL('../content/policy.yaml', import.meta.url), 'utf8')));
  assert.equal(parsePolicy('topic_discovery:   # c\n  enabled: true\n').topic_discovery, true);
  assert.equal(parsePolicy('topic_discovery:\n  enabled: false  # off\n').topic_discovery, false);
  assert.equal(parsePolicy('garbage').paused, true, 'unreadable policy means paused');
});

test('pre-check: pause and weekly limit', () => {
  assert.equal(preCheck({ task: 'updater', policy, articles: real, now: NOW }).run, true);
  assert.equal(preCheck({ task: 'writer', policy: { ...policy, paused: true }, articles: real, now: NOW }).run, false);
  const twoNew = [...real, article('n1', '2026-11-24'), article('n2', '2026-11-25')];
  assert.equal(preCheck({ task: 'writer', policy, articles: twoNew, now: NOW }).run, false);
  assert.equal(preCheck({ task: 'updater', policy, articles: twoNew, now: NOW }).run, true, 'limit is for the writer only');
});

test('clean updater change merges', () => {
  const next = clone(real);
  next[0].sections[0].b.push({ p: ['追加', 'Added'] });
  assert.equal(run({ newArticles: next }).decision, 'merge');
});

test('no changes → empty', () => {
  assert.equal(run({ changedFiles: ['agent-out/report.json'] }).decision, 'empty');
});

test('forbidden files, validator errors and deleted articles are rejected', () => {
  assert.equal(run({ changedFiles: ['content/articles.json', '.github/workflows/deploy.yml'] }).decision, 'reject');
  assert.equal(run({ validatorOk: false }).decision, 'reject');
  assert.equal(run({ newArticles: real.slice(1) }).decision, 'reject');
  const renamed = clone(real); renamed[0].slug = 'renamed';
  assert.equal(run({ newArticles: renamed }).decision, 'reject');
});

test('writer: one new article per run, weekly cap holds', () => {
  const one = [...real, article('new-one', '2026-11-26')];
  assert.equal(run({ task: 'writer', newArticles: one }).decision, 'merge');
  const two = [...one, article('new-two', '2026-11-26')];
  assert.equal(run({ task: 'writer', newArticles: two }).decision, 'reject');
  const base = [...real, article('a', '2026-11-23'), article('b', '2026-11-24')];
  assert.equal(run({ task: 'writer', baseArticles: base, newArticles: [...base, article('c', '2026-11-26')] }).decision, 'hold');
});

test('updater and editor may not create articles', () => {
  assert.equal(run({ newArticles: [...real, article('x', '2026-11-26')] }).decision, 'reject');
  assert.equal(run({ task: 'editor', slug: 'ai-seo', newArticles: [...real, article('x', '2026-11-26')] }).decision, 'reject');
});

test('editor touching other articles holds', () => {
  const next = clone(real);
  const i = next.findIndex((a) => a.slug === 'ai-seo');
  next[i].eyebrow = ['新', 'New'];
  assert.equal(run({ task: 'editor', slug: 'ai-seo', newArticles: next }).decision, 'merge');
  next[0].eyebrow = ['新', 'New'];
  assert.equal(run({ task: 'editor', slug: 'ai-seo', newArticles: next }).decision, 'hold');
});

test('date freshening without an update_log line holds', () => {
  const next = clone(real);
  next[0].updated_at = '2026-11-26';
  assert.equal(run({ newArticles: next }).decision, 'hold');
  next[0].update_log.push({ date: '2026-11-26', public: { ja: '数字を更新', en: 'Figures updated' } });
  assert.equal(run({ newArticles: next }).decision, 'merge');
});

test('too many changed articles holds', () => {
  const next = clone(real).map((a) => ({ ...a, read_minutes: a.read_minutes + 1 }));
  assert.equal(run({ policy: { ...policy, max_changed_articles_per_run: 3 }, newArticles: next }).decision, 'hold');
});

test('report flags, missing report and review mode hold', () => {
  const next = clone(real); next[0].read_minutes += 1;
  assert.equal(run({ newArticles: next, report: null }).decision, 'hold');
  assert.equal(run({ newArticles: next, report: { ...okReport, needs_human: true, needs_human_reason: 'x' } }).decision, 'hold');
  assert.equal(run({ newArticles: next, report: { ...okReport, injection_suspected: true } }).decision, 'hold');
  assert.equal(run({ newArticles: next, policy: { ...policy, publish_mode: 'review' } }).decision, 'hold');
});

test('new claims about Travelpayouts hold, existing ones do not', () => {
  const withTp = article('tp-new', '2026-11-26');
  withTp.sections[0].b.push({ p: ['Travelpayoutsは無料ブログでも使えます。ほかの文。', 'Travelpayouts works on free blogs. Other text.'] });
  const r = run({ task: 'writer', newArticles: [...real, withTp] });
  assert.equal(r.decision, 'hold');
  assert.match(r.reasons.join(' '), /Travelpayouts/);

  // an article that already mentions TP and is edited elsewhere stays mergeable
  const i = real.findIndex((a) => tpSentences(a).length);
  assert.ok(i >= 0, 'some current article mentions Travelpayouts');
  const next = clone(real); next[i].read_minutes += 1;
  assert.equal(run({ newArticles: next }).decision, 'merge');
});

test('a figure that does not match its source holds', () => {
  const next = clone(real); next[0].read_minutes += 1;
  const bad = { statements: 1, results: [{ status: 'mismatch', figure: '1,663,710', article_value: 1663710, source_value: 1663474, source_says: '166万3474人' }] };
  assert.equal(run({ newArticles: next, numberCheck: bad }).decision, 'hold');
  const falseAlarm = { statements: 1, results: [{ status: 'mismatch', figure: '3,912,500', article_value: 3912500, source_value: 3912500 }] };
  assert.equal(run({ newArticles: next, numberCheck: falseAlarm }).decision, 'merge');
});

test('excluded topics found by the meaning check hold', () => {
  const next = clone(real); next[0].read_minutes += 1;
  const found = { items: 2, findings: [{ slug: 'x', topic: 'law_ads', evidence: 'PR表示が義務', reason: 'labelling duty' }] };
  assert.equal(run({ newArticles: next, topicCheck: found }).decision, 'hold');
  assert.equal(run({ newArticles: next, topicCheck: { items: 2, findings: [] } }).decision, 'merge');
});

test('agent scratch files are ignored, modified tracked code still rejects', () => {
  const next = clone(real); next[0].read_minutes += 1;
  const r = run({ newArticles: next, changedFiles: ['content/articles.json', 'fix-quotes.py'], untrackedFiles: ['fix-quotes.py'] });
  assert.equal(r.decision, 'merge');
  assert.match(r.reasons.join(' '), /fix-quotes\.py/);
  assert.equal(run({ newArticles: next, changedFiles: ['content/articles.json', 'tools/validate.mjs'] }).decision, 'reject');
});

test('a new article without sources holds', () => {
  const a = article('no-src', '2026-11-26'); a.sources = [];
  assert.equal(run({ task: 'writer', newArticles: [...real, a] }).decision, 'hold');
});
