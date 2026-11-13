#!/usr/bin/env node
// Pipeline stage after generation: converts out/featured/<slug>-<style>[-<suffix>].png into the WebP
// assets the site imports. Each source yields two renditions:
//   <slug>-featured.webp  1424px wide (712 CSS px reading measure × 2, retina article cover)
//   <slug>-card.webp       832px wide (416 CSS px card × 2, retina card thumbnail)
// Usage:
//   node tools/featured-image/convert.mjs --all
//   node tools/featured-image/convert.mjs ai-seo click-reward
//   node tools/featured-image/convert.mjs --all --from=out/featured --out=src/assets/home --quality=85
//   node tools/featured-image/convert.mjs --all --master=1424 --card=832
//   node tools/featured-image/convert.mjs --all --dry
import { readdirSync, statSync, readFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const arg = (k, d) => (args.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1] || d;
const flags = new Set(args.filter((a) => a.startsWith('--')));
const slugs = args.filter((a) => !a.startsWith('--'));

const fromDir = resolve(ROOT, arg('from', 'out/featured'));
const outDir = resolve(ROOT, arg('out', 'src/assets/home'));
const quality = Number(arg('quality', '85'));
// Retina targets: the article cover renders at a 712px reading measure, the card at 416px.
const masterWidth = Number(arg('master', '1424'));
const cardWidth = Number(arg('card', '832'));
const all = flags.has('--all');
const dry = flags.has('--dry');

const USAGE = 'usage: node tools/featured-image/convert.mjs [--all | <slug>...] [--from=dir] [--out=dir] [--quality=85] [--master=1424] [--card=832] [--dry]';
// Generate names files <slug>-<style>.png (optionally -<suffix>); slugs may contain hyphens themselves.
const NAME = /^(.+?)-(tile|bubble|polaroid)(?:-.*)?\.png$/i;

function discover() {
  let files;
  try {
    files = readdirSync(fromDir);
  } catch {
    throw new Error(`no such directory: ${fromDir} (run the generator first)`);
  }
  const map = new Map();
  for (const name of files) {
    const m = name.match(NAME);
    if (!m) continue;
    const file = resolve(fromDir, name);
    const list = map.get(m[1]) ?? [];
    list.push({ name, file, mtime: statSync(file).mtimeMs });
    map.set(m[1], list);
  }
  return map;
}

// Registry from covers.ts: slug -> basename of the asset it currently renders.
function coverAssets() {
  const ts = readFileSync(resolve(ROOT, 'src/data/covers.ts'), 'utf8');
  const imports = new Map([...ts.matchAll(/^import\s+(\w+)\s+from\s+'([^']+)'/gm)].map((m) => [m[1], m[2].split('/').pop()]));
  const map = new Map();
  for (const m of ts.matchAll(/^\s*'?([a-z0-9-]+)'?:\s*\{\s*img:\s*(\w+)/gm)) {
    map.set(m[1], imports.get(m[2]) ?? '');
  }
  return map;
}

async function main() {
  if (!all && slugs.length === 0) throw new Error(USAGE);

  const found = discover();
  // Explicit slugs win over --all, so `npm run covers` (all) and `npm run covers -- ai-seo` both work.
  const targets = slugs.length ? slugs : [...found.keys()].sort();
  const missing = targets.filter((s) => !found.has(s));
  if (missing.length) {
    throw new Error(`no generated PNG for: ${missing.join(', ')} (found: ${[...found.keys()].sort().join(', ') || 'none'})`);
  }

  mkdirSync(outDir, { recursive: true });
  const covered = coverAssets();
  let converted = 0;

  for (const slug of targets) {
    const current = covered.get(slug);
    const expected = `${slug}-featured.webp`;
    // Only slugs whose live cover is this generated master get a card rendition; otherwise the
    // card would show a different picture than the article cover (e.g. a design illustration).
    const usesGenerated = current === expected;

    // Several styles for one slug are possible (tile/bubble/polaroid, plus --suffix runs): newest wins.
    const [src, ...older] = found.get(slug).sort((a, b) => b.mtime - a.mtime);
    const master = resolve(outDir, expected);
    const card = resolve(outDir, `${slug}-card.webp`);

    if (dry) {
      const cardPlan = usesGenerated ? `${basename(card)} (${cardWidth}px)` : `no card (cover is ${current})`;
      console.log(`would convert ${src.name} -> ${basename(master)} (${masterWidth}px), ${cardPlan}`);
      continue;
    }

    const meta = await sharp(src.file).metadata();
    // The model returns a fixed ~1376x768 PNG, so resize to the exact retina widths the site uses.
    const masterInfo = await sharp(src.file).resize({ width: masterWidth }).webp({ quality, effort: 5 }).toFile(master);
    const cardInfo = usesGenerated
      ? await sharp(src.file).resize({ width: cardWidth }).webp({ quality, effort: 5 }).toFile(card)
      : null;
    // 1376x768 is the generator's 16:9 output (~0.8% off), so compare relative deviation.
    const offAspect = meta.width && meta.height && Math.abs(meta.width / meta.height - 16 / 9) / (16 / 9) > 0.02;
    const notes = [
      older.length && `ignored ${older.length} older variant(s)`,
      offAspect && `⚠ ${meta.width}x${meta.height} is not 16:9`,
      // Not an error: covers.ts may still point at a design illustration, or not list the slug yet.
      current !== expected && (current ? `covers.ts uses ${current}` : '⚠ no covers.ts entry'),
    ].filter(Boolean);

    const cardLog = cardInfo
      ? `, ${basename(card)} ${cardInfo.width}x${cardInfo.height} ${Math.round(cardInfo.size / 1024)}KB`
      : '';
    console.log(`${slug}: ${src.name} -> ${basename(master)} ${masterInfo.width}x${masterInfo.height} ${Math.round(masterInfo.size / 1024)}KB${cardLog}${notes.length ? '  (' + notes.join(' · ') + ')' : ''}`);
    converted++;
  }

  if (!dry) console.log(`\n${converted} file(s) written to ${outDir.replace(ROOT + '/', '')}/`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
