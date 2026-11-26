#!/usr/bin/env node
// Featured images for new articles (writer pipeline, .github/workflows/agent.yml), or for given slugs.
//   node tools/featured-image/new-covers.mjs --base <sha>        new articles since <sha> that have no cover
//   node tools/featured-image/new-covers.mjs --slugs market-size  explicit slugs (backfill)
// For each slug: generate.mjs (OpenRouter image model) → convert.mjs (WebP cover + card in astro/src/assets/home).
// Writes agent-out/images.json + images.md and images_ok=true|false to $GITHUB_OUTPUT. Exit code 0 unless misused:
// a failed image is reported (the workflow then holds the PR), it does not crash the run.
import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : ''; };

/** Slugs present in `next` but not in `base`. */
export const addedSlugs = (base, next) => {
  const before = new Set(base.map((a) => a.slug));
  return next.map((a) => a.slug).filter((s) => !before.has(s));
};

/** Slugs that already have a cover: a generated file, or a hand-written entry in covers.ts. */
export function hasCover(slug, coversTs, exists = existsSync) {
  if (exists(resolve(ROOT, `astro/src/assets/home/${slug}-featured.webp`))) return true;
  return new RegExp(`^\\s*'?${slug}'?:\\s*\\{\\s*img:`, 'm').test(coversTs);
}

function main() {
  const articles = JSON.parse(readFileSync(resolve(ROOT, 'content/articles.json'), 'utf8'));
  let slugs = arg('slugs') ? arg('slugs').split(',').map((s) => s.trim()).filter(Boolean) : [];
  if (!slugs.length && arg('base')) {
    const base = JSON.parse(execFileSync('git', ['show', `${arg('base')}:content/articles.json`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 }));
    slugs = addedSlugs(base, articles);
  }
  if (!slugs.length && !arg('base')) { console.error('usage: new-covers.mjs --base <sha> | --slugs a,b'); process.exit(2); }

  const coversTs = readFileSync(resolve(ROOT, 'astro/src/data/covers.ts'), 'utf8');
  const results = [];
  for (const slug of slugs) {
    if (hasCover(slug, coversTs)) { results.push({ slug, ok: true, skipped: 'already has a cover' }); continue; }
    try {
      const gen = execFileSync('node', ['tools/featured-image/generate.mjs', slug], { cwd: ROOT, encoding: 'utf8', timeout: 180_000 });
      const conv = execFileSync('node', ['tools/featured-image/convert.mjs', slug], { cwd: ROOT, encoding: 'utf8', timeout: 120_000 });
      const ok = existsSync(resolve(ROOT, `astro/src/assets/home/${slug}-featured.webp`)) && existsSync(resolve(ROOT, `astro/src/assets/home/${slug}-card.webp`));
      results.push({ slug, ok, log: (gen + conv).trim().split('\n').slice(-3).join(' | '), ...(ok ? {} : { error: 'converted files missing' }) });
    } catch (e) {
      results.push({ slug, ok: false, error: String(e.stderr || e.message).trim().slice(0, 300) });
    }
  }

  const allOk = results.every((r) => r.ok);
  const md = !results.length ? 'Обложки: новых статей нет.'
    : ['Обложки новых статей:', ...results.map((r) => `- ${r.slug}: ${r.ok ? (r.skipped ? `пропущено (${r.skipped})` : 'сгенерирована') : `**не получилось** — ${r.error}`}`)].join('\n');
  console.log(md);
  mkdirSync(resolve(ROOT, 'agent-out'), { recursive: true });
  writeFileSync(resolve(ROOT, 'agent-out/images.json'), JSON.stringify({ ok: allOk, results }, null, 1) + '\n');
  writeFileSync(resolve(ROOT, 'agent-out/images.md'), md + '\n');
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `images_ok=${allOk}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
