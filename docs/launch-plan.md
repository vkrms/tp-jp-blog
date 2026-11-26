# Launch plan: agentic writing and editing (target 2026-11-26)

Filament/Laravel is parked for the launch. It stays in the repo, untouched; `content:import` already reads the
files the agents will be editing, so stage 2 can pick up from the launch state later.

## Launch architecture ("stage 1.5")

Content stays in the repo (`content/*.json|yaml`), the site is built from files (as today). Agents run in GitHub
Actions and change content through pull requests; deterministic code decides what gets merged and deployed.

```
cron / manual run ─► GitHub Actions job
   1. pre-check (code): policy.paused? weekly limit reached? → stop
   2. agent run (Claude Code headless, prompts from agents/*.md, tools restricted, see below)
   3. gate (code, tools/agent-gate.mjs): allowed files only, validator green, limits, no slug changes,
      no date freshening, needs_human flag → decide merge / leave PR open
   4. PR with the agent's report as description (her "report in PR" model)
   5. merge if gate passed and publish_mode = auto
push to main ─► deploy.yml: npm ci → npm run check → build:prod → rsync to Hostinger
```

Why this and not the spec's Laravel orchestrator: the content owner's prompts (`agents/*.md`, `seo-ja.md`,
`topic-discovery.md`) are written for exactly this runtime (an agent with file, search and fetch tools in the repo),
the workflow templates exist, and nothing new has to be hosted. The spec's core rule — publishing is decided by code,
not by the model — is kept by the gate.

## Agent features at launch

| Feature | Trigger | What it does |
|---|---|---|
| **Writer** | cron weekly (Mon morning JST) + manual | Topic from `queue.json` (or topic discovery), one new article JA+EN per run, facts to `facts.yaml`, source links inline |
| **Updater** | cron weekly + manual | Facts due for refresh, source links (first run: adds the 24 missing links to the 12 articles), expired sales → 終了 |
| **Editor** | manual only (`workflow_dispatch` with `slug` + free-text `instruction`) | Agentic edit of one article on request: "shorten the title", "add a FAQ about X", "update with source Y" |

The editor is the "agentic editing" feature without a UI: run from the GitHub Actions tab (or `gh workflow run`).

## Guardrails (code, not prompts)

- **Tool permissions** (Claude Code `--allowedTools`): `Read`, `Edit`, `Write` (content/ only, checked again by the gate),
  `WebSearch`, `WebFetch` **limited to registry domains** (`WebFetch(domain:…)` generated from `sources.json`),
  `Bash(node tools/validate.mjs)`. No other shell, no git, no network beyond that.
- **Gate** (`tools/agent-gate.mjs`, runs after the agent, before any commit):
  - only `content/articles.json`, `content/facts.yaml`, `content/sources.json`, `content/queue.json` changed;
  - `node tools/validate.mjs` exits 0;
  - new articles in the last 7 days ≤ `limits.max_new_articles_per_week`; changed articles ≤ `max_changed_articles_per_run`;
  - no slug renamed or article deleted;
  - `updated_at` changed only where `update_log` gained an entry (no date freshening);
  - report says `needs_human: true` or `injection_suspected: true` → PR stays open, no merge;
  - `policy.paused: true` → nothing runs.
- **Emergency stop**: `paused: true` in `policy.yaml` (one-line commit). **Rollback**: `git revert` → deploy.

## Timeline (one working day)

| # | Block | Est. | Done when |
|---|---|---|---|
| 0 | Decisions + secrets (list below) | 0.5 h | agent can authenticate in CI |
| 1 | `deploy.yml`: build from files + rsync on push to main (replaces local `tools/deploy.sh` for agent merges) | 1 h | manual run deploys the current site unchanged |
| 2 | Writer/updater/editor workflows rewritten for the current repo (astro/ layout, gate, PR + merge) | 2 h | dry-run job produces a PR without merging |
| 3 | `tools/agent-gate.mjs` + tests on crafted diffs | 1.5 h | gate rejects each forbidden case |
| 4 | Prompt touch-ups (paths, report format with needs_human/injection flags, editor prompt) | 1 h | — |
| 5 | Test runs on a branch: updater (source links), writer (one article), editor (one title fix) | 2–3 h | output reviewed by a human, gate green |
| 6 | Go live: merge, deploy (also ships the EN-noindex change), enable cron | 0.5 h | site live, first scheduled run queued |

Blocks 1–4 can be built tonight/early; block 5 needs real model calls and a human reading Japanese output.

## Decided (2026-11-26)
- Agent auth: **the existing OpenRouter key** via its Anthropic-compatible endpoint. Verified locally with Claude Code
  2.1.332: plain prompt, WebSearch and registry-limited WebFetch all work (`ANTHROPIC_BASE_URL=https://openrouter.ai/api`).
- **Personal GitHub account** (`vkrms/tp-jp-blog`, public) runs Actions; Actions **deploys to Hostinger** via `tools/deploy.sh`.
- Rehearsal (local, same steps as CI): editor shortened the `ai-seo` title 39 → 23 chars, 2-line diff, date untouched,
  gate `merge`, ~$0.43 / 2 min.
- Rehearsal, writer (topic discovery, empty queue): new article `free-blog-vs-wordpress`, title 28 chars, JAO figures
  correct with inline source links, site builds (33 pages); ~$2.12 / 10.5 min, 45 turns. Misses: an unapproved claim about
  Travelpayouts (now held by the gate), no inbound links from existing articles, topic not recorded in the queue format
  (both added to `agents/runtime.md`). Expected model spend at the planned cadence: roughly **$40–55/month**
  (writer ~9 × $2.1 ≈ $19; editor ~20 × $0.43 ≈ $9; updater 4–5 runs, not measured yet, guessed $2–5 each), to be
  confirmed against the OpenRouter dashboard.

## Go-live checklist (you)
1. **Repo settings** → Actions → General → Workflow permissions: *Read and write*, and tick
   *Allow GitHub Actions to create and approve pull requests* (agent PRs need it).
2. **Secrets** (Settings → Secrets and variables → Actions, or `gh secret set`), values from your local `.env`:
   `OPENROUTER_KEY`, `DEPLOY_HOST`, `DEPLOY_PORT`, `DEPLOY_USER`, `DEPLOY_PATH`, and `DEPLOY_SSH_KEY` = the **private key
   file contents** (`gh secret set DEPLOY_SSH_KEY < ~/.ssh/<deploy key>`).
3. **Push** `main`.
4. **First deploy by hand**: Actions → *deploy* → Run workflow. Checks the secrets end to end and ships the EN-noindex change.
5. **Dry runs** (open a PR, never merge) and read the PRs:
   - *agent: edit* — e.g. `slug=ai-seo`, instruction "shorten the title to ≤32 chars";
   - *agent: update* — first run adds the missing source links. It touches 11 articles, which is more than
     `max_changed_articles_per_run: 10`, so expect **hold** (merge by hand after reading) or run it twice;
   - *agent: write* — one article; read the Japanese before trusting auto-merge.
6. Merge the PRs you approve (a manual merge to main triggers *deploy* by itself).
7. **Switch on the schedule**: repository variable `AGENTS_ENABLED=true` (writer Mon+Thu, updater Wed, 09:00 JST).
   Optional variables: `AGENT_MODEL` (default `anthropic/claude-sonnet-4.5`), `AGENT_SMALL_MODEL`.
8. Emergency stop at any time: `paused: true` in `content/policy.yaml` (or unset `AGENTS_ENABLED` for the schedule).

## Decisions needed before block 0 (original list; 1, 2 and 5 resolved above)

1. **Agent auth** (the only hard blocker), one of:
   - a. `CLAUDE_CODE_OAUTH_TOKEN` from the content owner's Claude Team subscription (her original plan; company OK still unconfirmed);
   - b. `ANTHROPIC_API_KEY` from an org account in Claude Console;
   - c. the existing OpenRouter key through its Anthropic-compatible endpoint (`ANTHROPIC_BASE_URL`) — must be verified in the first hour; if it works, billing stays on the one key we have.
2. **Secrets in GitHub** (repo is public; secrets are not exposed to forks): `DEPLOY_HOST/PORT/USER/PATH/SSH_KEY`, the agent auth secret. Set by you.
3. **Merge mode on day one**: auto-merge when the gate passes (owner's decision) — confirm it applies from the very first run, or keep the first 2–3 runs as open PRs.
4. **Topic discovery at launch**: on with WebSearch + registry-only WebFetch (my default), or off (queue only).
5. **Push/deploy approval**: workflows only exist once pushed; go-live needs your OK for push and the first deploy.

## Not in the launch (stays on the backlog)

Filament admin and Laravel hosting, editor AI buttons in the UI, MySQL content, weekly email digest
(report lives in PRs), Search Console integration, Basic Auth on `/en/`.

## Risks

- Japanese quality without a native check (accepted by the owner for the pilot) — mitigated by `seo-ja.md` §8 self-check and the human read in block 5.
- A bad article auto-publishes → `paused` + `git revert`; weekly cap of 2 limits the blast radius.
- Claude Code CI runs are slower/longer than a single API call; job timeout 30 min.
- Prompt injection via fetched pages: fetch limited to registry domains, report flag blocks merge; no fetch log like the spec's (accepted for launch).
