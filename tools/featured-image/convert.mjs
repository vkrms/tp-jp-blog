#!/usr/bin/env node
// Pipeline stage after generation: converts out/featured/<slug>-<style>[-<suffix>].png into the WebP
// assets the site imports (src/assets/home/<slug>-featured.webp).
// Usage:
//   node tools/featured-image/convert.mjs --all
//   node tools/featured-image/convert.mjs ai-seo click-reward
//   node tools/featured-image/convert.mjs --all --from=out/featured --out=src/assets/home --quality=85
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
const all = flags.has('--all');
const dry = flags.has('--dry');

const USAGE = 'usage: node tools/featured-image/convert.mjs [--all | <slug>...] [--from=dir] [--out=dir] [--quality=85] [--dry]';
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

    // Several styles for one slug are possible (tile/bubble/polaroid, plus --suffix runs): newest wins.
    const [src, ...older] = found.get(slug).sort((a, b) => b.mtime - a.mtime);
    const dest = resolve(outDir, expected);

    if (dry) {
      console.log(`would convert ${src.name} -> ${basename(dest)}`);
      continue;
    }

    const meta = await sharp(src.file).metadata();
    const info = await sharp(src.file).webp({ quality, effort: 5 }).toFile(dest);
    // 1376x768 is the generator's 16:9 output (~0.8% off), so compare relative deviation.
    const offAspect = meta.width && meta.height && Math.abs(meta.width / meta.height - 16 / 9) / (16 / 9) > 0.02;
    const notes = [
      older.length && `ignored ${older.length} older variant(s)`,
      offAspect && `⚠ ${meta.width}x${meta.height} is not 16:9`,
      // Not an error: covers.ts may still point at a design illustration, or not list the slug yet.
      current !== expected && (current ? `covers.ts uses ${current}` : '⚠ no covers.ts entry'),
    ].filter(Boolean);

    console.log(`${slug}: ${src.name} -> ${basename(dest)} ${info.width}x${info.height} ${Math.round(info.size / 1024)}KB${notes.length ? '  (' + notes.join(' · ') + ')' : ''}`);
    converted++;
  }

  if (!dry) console.log(`\n${converted} file(s) written to ${outDir.replace(ROOT + '/', '')}/`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
