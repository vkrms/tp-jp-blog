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
- ~~§2.1 layout~~ — decided: one repo, `astro/` + `laravel/`, shared `agents/`, `content/`, `docs/`, `tools/` at root (spec §2.1, README). Physical move of Astro into `astro/` happens at build time, not yet.
- §2.2/§3.3: "Blade component" per block type is stale (Astro renders); block list lacks `h3`, `img`.
- §4.7: `sections[].blocks[{type}]` vs real format `sections[].b[]` with single-key blocks.
- §8.2: category pages listed; stage 1 deliberately has none.
- §8.3: design source is `docs/design.md`, not `prototype/head.html`.
- §12: phases 0–6 clash with "stage 1/2" naming; phase 2 (Astro) already done; phases 3 and 5 mention scheduled rebuilds, contradicting the event-only trigger in §11.2.
- §13: numbering skips 5; header version/date stale.
- `policy.yaml` vs `settings` table: define one source of truth (suggest: yaml seeds DB on import, DB wins).
- Fact placeholders `{{fact:id}}` (§3.2): when to migrate the 12 articles.
- Writer inputs: Asya's keyword sheet (mentioned in `agents/writer.md`) — in or out?

## Cleanup after the spec is final
- Rewrite README as a short entry point pointing to `spec.md`.
- Delete `.github/workflows/{write,update,validate}.yml` (Claude Code / PR-based concept, superseded).
- Note in `spec-stage1.md` the fallbacks actually taken: single `content/articles.json`, local `tools/deploy.sh` instead of `deploy.yml`.
