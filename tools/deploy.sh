#!/usr/bin/env sh
# Build the production site and rsync astro/dist/ to the Hostinger docroot.
#
#   tools/deploy.sh              # dry run: build, then show what rsync would do
#   tools/deploy.sh --yes        # actually deploy
#   tools/deploy.sh --yes --skip-build
#
# Credentials live in .env (not tracked): DEPLOY_HOST, DEPLOY_PORT, DEPLOY_USER,
# DEPLOY_PATH, DEPLOY_SSH_KEY — see docs/spec-stage1.md §8.
# Excluded paths: tools/rsync-exclude.txt
set -eu

usage() {
  cat <<'EOF'
Usage: tools/deploy.sh [--yes] [--skip-build]

  (no flags)    build, then rsync in dry-run mode (no server changes)
  --dry-run     same as no flags, stated explicitly
  --yes, -y     build and actually deploy
  --skip-build  deploy the existing astro/dist/ as-is
  -h, --help    this help
EOF
}

die() {
  echo "error: $*" >&2
  exit 1
}

cd "$(dirname "$0")/.."
DIST=astro/dist

DEPLOY=0
SKIP_BUILD=0
for arg in "$@"; do
  case "$arg" in
    --yes | -y) DEPLOY=1 ;;
    --dry-run) DEPLOY=0 ;;
    --skip-build) SKIP_BUILD=1 ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      echo "unknown argument: $arg" >&2
      usage >&2
      exit 2
      ;;
  esac
done

# --- credentials -----------------------------------------------------------
[ -f .env ] || die ".env with DEPLOY_* variables is required"

set -a
# shellcheck disable=SC1091
. ./.env
set +a

: "${DEPLOY_HOST:?DEPLOY_HOST is not set in .env}"
: "${DEPLOY_PORT:?DEPLOY_PORT is not set in .env}"
: "${DEPLOY_USER:?DEPLOY_USER is not set in .env}"
: "${DEPLOY_PATH:?DEPLOY_PATH is not set in .env}"
: "${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY is not set in .env}"

# .env values are read, not shell-expanded, so expand a leading ~/ ourselves.
case "$DEPLOY_SSH_KEY" in
  "~/"*) SSH_KEY="$HOME/${DEPLOY_SSH_KEY#\~/}" ;;
  *) SSH_KEY="$DEPLOY_SSH_KEY" ;;
esac

[ -f "$SSH_KEY" ] || die "SSH key not found: $SSH_KEY"
[ -f tools/rsync-exclude.txt ] || die "tools/rsync-exclude.txt is missing"

# --- build -----------------------------------------------------------------
if [ "$SKIP_BUILD" -eq 0 ]; then
  echo "==> build (npm run build:prod)"
  npm run build:prod
fi

[ -f "$DIST/index.html" ] || die "$DIST/index.html is missing — build first"

# Guard: a build without INDEXING=true ships "Disallow: /" and noindex meta,
# which silently de-indexes the site. Refuse to publish it.
if grep -q '^Disallow: /' "$DIST/robots.txt" 2>/dev/null; then
  die "$DIST/robots.txt blocks crawling (INDEXING was not true) — refusing to deploy"
fi

# --- rsync -----------------------------------------------------------------
RSYNC_ARGS="-avz --delete-delay --itemize-changes --exclude-from=tools/rsync-exclude.txt"
[ "$DEPLOY" -eq 0 ] && RSYNC_ARGS="$RSYNC_ARGS --dry-run"

SSH_CMD="ssh -i $SSH_KEY -p $DEPLOY_PORT -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new"

echo "==> source:      $DIST/ ($(du -sh "$DIST" | cut -f1))"
echo "==> destination: $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH"
if [ "$DEPLOY" -eq 0 ]; then
  echo "==> DRY RUN (pass --yes to deploy)"
fi

# shellcheck disable=SC2086 # args are intentionally word-split
rsync $RSYNC_ARGS -e "$SSH_CMD" "$DIST/" "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH"

if [ "$DEPLOY" -eq 0 ]; then
  echo "==> dry run finished, nothing changed"
  exit 0
fi

# --- smoke check -----------------------------------------------------------
# Derive the public URL from the built robots.txt instead of hardcoding it.
SITE=$(sed -n 's|^Sitemap: \(.*\)/sitemap\.xml$|\1|p' "$DIST/robots.txt")
if [ -n "$SITE" ] && command -v curl >/dev/null 2>&1; then
  echo "==> checking $SITE/"
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$SITE/") || code="000"
  if [ "$code" = "200" ]; then
    echo "==> deployed, homepage returned $code"
  else
    echo "warning: homepage returned $code — check the server" >&2
  fi
fi

echo "==> done"
