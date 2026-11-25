# Next step: finalize `docs/spec.md`

Decided 2026-11-25:
- **`docs/spec.md` is the source of truth** for stage 2 (Laravel + Filament admin, MySQL, OpenRouter orchestrator, Astro rebuilt via GitHub Actions → rsync to Hostinger).
- README, `docs/spec-stage1.md`, `agents/*.md`, `content/policy.yaml`, `.github/workflows/{write,update,validate}.yml` are **inspiration / concept only**. Where they disagree with `spec.md`, `spec.md` wins.
- `spec.md` is incomplete and still needs finalizing. That is the next task.

## Open decisions
1. ~~**Web search**~~ — decided, spec §4.1/§4.4.1: updater = orchestrator fetch only; writer + editor AI actions = fetch + OpenRouter search limited to registry domains.
2. ~~**Publish mode**~~ — decided: `auto` from launch (original intent, Marisha); `review` stays only as an incident switch. Spec §1, §3.1, §6, §10, §12 updated.
3. ~~**Prompts**~~ — decided, spec §4.5: rewritten when the orchestrator is built; shared `rules.md` + short task prompts; writer follows the article profile.

## Fix in `spec.md`
- ~~§2.1 layout~~ — decided: one repo, `astro/` + `laravel/`, shared `agents/`, `content/`, `docs/`, `tools/` at root (spec §2.1, README). Astro moved into `astro/` (npm workspace), build output verified identical.
- §2.2/§3.3: "Blade component" per block type is stale (Astro renders); block list lacks `h3`, `img`.
- §4.7: `sections[].blocks[{type}]` vs real format `sections[].b[]` with single-key blocks.
- §8.2: category pages listed; stage 1 deliberately has none.
- §8.3: design source is `docs/design.md`, not `prototype/head.html`.
- §12: phases 0–6 clash with "stage 1/2" naming; phase 2 (Astro) already done; phases 3 and 5 mention scheduled rebuilds, contradicting the event-only trigger in §11.2.
- §13: numbering skips 5; header version/date stale.
- ~~`policy.yaml` vs `settings`~~ — decided: yaml seeds `settings` on import, DB wins (spec §10).
- Fact placeholders `{{fact:id}}` (§3.2): when to migrate the 12 articles.
- Writer inputs: Asya's keyword sheet (mentioned in `agents/writer.md`) — in or out?

## Cleanup after the spec is final
- Rewrite README as a short entry point pointing to `spec.md`.
- Delete `.github/workflows/{write,update,validate}.yml` (Claude Code / PR-based concept, superseded).
- Note in `spec-stage1.md` the fallbacks actually taken: single `content/articles.json`, local `tools/deploy.sh` instead of `deploy.yml`.

## Implementation progress (spec §12 phases)
- Phase 1, done: DB schema (§3.1), `php artisan content:import` (§10), export API `/api/export/*` with bearer token (§8.1), tests. Astro builds from the API when `CONTENT_API_URL` / `CONTENT_API_TOKEN` are set; output verified byte-identical to the file build.
- Phase 1, done: PHP validator `content:validate` (§6), same result as `tools/validate.mjs` on current content. Not yet: `{{fact:…}}` checks, `tp_approved_numbers` / competitor rules (need exact trigger rules).
- Phase 3, done: Filament admin (spec §9 status note) + rebuild trigger via repository_dispatch (§11.2) + audit log. Not yet: block editor, rebuild-failure email, build-token rotation.
- Next: `deploy-frontend.yml` (build from API + atomic rsync, §11.2) and the orchestrator (phase 4).

## Content owner handoff, 2026-11-25 (`agents/seo-ja.md`, `agents/topic-discovery.md`)
Done:
- EN closed from search: noindex on all EN pages, no hreflang, EN out of the sitemap, nofollow on the switcher link (spec §8.3). **Live site still has the old EN/hreflang setup until the next deploy.**
- Inline source links `[anchor](https://…)` rendered as links; meta description JA cut at 100 chars (§7.1, §8.3).
- Validators (JS from the handoff, PHP port) check source links + SEO rules; identical output (0 errors, 30 warnings).
- Update date moves only on substantive edits (= edits that add a public 更新履歴 line).
- Her prompts / rules.json / policy.yaml / validate.mjs / README changes are in the repo. Her `articles.json` was NOT taken (older than ours: pre-expansion `sales-calendar`).

Open decisions (spec §13, items 15–17): topic discovery web access, weekly report by email or not, Basic Auth on `/en/`.

Backlog:
- **Existing 12 articles** (editorial, can be done in the admin or with `tools/edit-article.mjs`):
  - add source links: 24 article–source pairs have none (validator warnings);
  - shorten 5 JA titles over 32 chars: ai-seo (39), sales-calendar (37), instagram (37), travel-demand (34), earn-or-not (33);
  - what-is-affiliate: only 1 related article (needs 2–5);
  - facts with homepage-only `source_url` (traicy.com/, suzukikenichi.com/blog/) → specific pages.
  - When done: `rules.json → source_links.enforce: true` (warnings become errors).
- **Orchestrator (phase 4)** must cover:
  - `topic_queue`: new status `approved` and fields `intent`, `origin`, `demand_estimate`, `serp_gap`, `angle`, `evidence`, `sources_planned`, `score` (+ port of the queue checks from `validate.mjs`);
  - writer output contract (§4.7): also edits to 1–2 existing articles that link to the new one (`related` + a sentence);
  - link check (HTTP 200) for every source link before publishing, by our fetcher;
  - updater: add/refresh source links each run, never touch slug, no date freshening;
  - Search Console data (`content/gsc/*.csv` in her plan) as a topic source; stop rule "3 weeks without impressions → propose turning discovery off".
