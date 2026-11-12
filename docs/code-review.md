# Code review: quality, smells, principles

Date: 2026-11-12. Scope: `src/`, `astro.config.mjs`, `tools/validate.mjs` (other tools skimmed).
`astro check`: 0 errors, 0 warnings, 0 hints.

## Overall: solid, about B+

The structure is clean and consistent. Most problems are leaks: content and copy living in code,
weak types at the data boundary, and some duplication. There are also a few real bugs.

## What's good

- **Clear layers.** Page files are thin wrappers, there's one place that reads content
  (`src/data/content.ts`), and each component does one job and has a header comment explaining it.
- **Almost no client-side JS.** The TOC and FAQ use native `<details>`. The only script is the
  category tabs.
- **SEO is done properly:** canonical, hreflang including x-default, OG tags, JSON-LD (Article,
  FAQ, breadcrumbs), and noindex controlled by an env variable.
- **Escaping is safe.** `rich()` escapes the text before turning `**bold**` into `<mark>`, so the
  many `set:html` calls are safe.
- **Images use `<Image>`** with sensible `widths`/`sizes`, and the LCP image gets `fetchpriority`.

## Bugs

1. **Category breadcrumb doesn't filter.** `ArticleHeader.astro` links to `/articles/#<cat>`, but
   the script in `_Articles.astro` never reads `location.hash`, so the list stays unfiltered.
2. **Links to pages that don't exist.** The header, footer and home-page glossary terms link to
   `/glossary/` and `/about/`. Neither page exists, so these are internal 404s, which also hurts SEO.
3. **The in-article CTA can silently vanish.** It's placed by exact match on the JA section heading
   (`ArticleLayout.astro`). If an agent rewords that heading, the CTA disappears and the validator
   doesn't catch it. Either anchor it to a section index or id, or add a check to `validate.mjs`.
4. **`clip()` doesn't do what its comment says.** It claims to cut "on a word boundary", but it
   cuts at `max-1` and only trims one trailing space or 、。. English meta descriptions get cut
   mid-word.
5. **The `Diff.astro` prefix regex is too greedy.** `/^[^：:]{1,12}[：:]\s*/` removes any short
   "X:" prefix, not just 更新前/更新後. A real "Note: …" or "注意：" would be dropped.
6. **JSON-LD doesn't escape `<`.** If LLM-written content ever contains `</script>`, it breaks out
   of the tag. One-line fix: `.replace(/</g, '\\u003c')`.
7. **Builds can silently use localhost.** `site` falls back to `http://localhost:4321`. A
   production build without `SITE_URL` ships localhost canonicals and hreflang with no error. CI
   should fail instead.

## Type safety

- `type Text = unknown`, `Record<string, any>` in `BlockRenderer`, and `as unknown as Article[]`
  together cancel out the `strict` tsconfig.
- **Fix:** normalize both content text forms (`[ja,en]` and `{ja,en}`) to one shape inside
  `content.ts`, and validate the JSON there (with zod, or by moving to Astro content collections).
  Then `tx` takes a real type, and `BlockRenderer` can narrow with `'p' in block`.
- `tr(p: P | readonly [string, string])`: those two types are the same.

## Duplication

- The nav items array is defined twice, in `Header.astro` and `Footer.astro`.
- The `/articles/${slug}/` URL is built in 3 places (ArticleCard, ArticleLayout, ArticleJsonLd).
  An `articleUrl(lang, slug)` helper would fix that.
- The sort by `updated_at` is repeated in `_Home` and `_Articles`.
- `ArticleCard` strips `**` by hand instead of calling `plain()`.
- There are two icon sources (`Icon.astro` paths and `data/icons.json`), and `plane` and `ticket`
  are identical paths.
- The ja and en `[slug].astro` pages are copy-pasted. That's acceptable at this size.

## Text and content living in code

- `lang === 'ja' ? '…' : '…'` is scattered around for page titles, the hero and promo alt texts,
  the breadcrumb aria-label and the CTA label, bypassing `T`.
- `content.ts` says content lives in `content/`, but cover alt texts (`covers.ts`), CTA copy
  (`i18n/cta.ts`) and the news banner (`T.news` plus the hardcoded sales-calendar link) are all in
  `src/`. Agents editing content won't see them.
- Cover file names are mixed: some are hashes (`12e13e5d91.jpg`), others are slug-named.

## Smells

- **Commented-out code.** This includes the `ArticleSidebar.astro` "About the editors" block with
  its commented imports, and the sticky bar in `Footer.astro` (which also hardcodes the `KEY` URL).
  Git already keeps the history, so delete them, or use a flag if you plan to toggle them. Their
  strings in `T` (`profH`, `profName`, `profP`, `stbar`) are now unused.
- `ArticleCard` declares an `eager` prop it never uses.
- **Tools:** `validate.mjs` is dense one-liners and also checks `prototype/index.html`, which
  couples it to the prototype. `.env` parsing is hand-written; Node's `process.loadEnvFile()` does
  this. Quote style is mixed across files. There's no lint or prettier config and no tests (even a
  snapshot test of one built article would help).
- `typescript` and `@astrojs/check` are in `dependencies` instead of `devDependencies`. This is
  minor.

## Priority

1. Fix bugs 1, 2, 3 and 7, since they're visible or affect SEO.
2. Normalize and validate content at the boundary, which removes the `unknown`/`any`.
3. Move the inline ja/en strings into `T` and the content-like data into `content/`.
4. Remove the commented-out code and the unused strings.

Bugs 1, 4, 6 and 7 are a few lines each.
