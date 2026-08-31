#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${COSMICA_SSH_HOST:-cosmica}"
BRANCH="${COSMICA_DEPLOY_BRANCH:-main}"
REMOTE_SRC="${COSMICA_REMOTE_SRC:-~/src/cosmica}"
REMOTE_WEB="${COSMICA_REMOTE_WEB:-~/public_html/cosmica}"

if ! ssh -G "$HOST" >/dev/null 2>&1; then
  echo "SSH host \"$HOST\" is not configured." >&2
  echo "Add deploy/ssh-config.example to ~/.ssh/config and install the matching private key." >&2
  exit 1
fi

ssh "$HOST" bash -s <<EOF
set -euo pipefail
export NVM_DIR="\$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
cd "$REMOTE_SRC"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
npm ci
npm run build
rsync -a --delete dist/ "$REMOTE_WEB/"
EOF

COMMIT="$(git rev-parse --short HEAD)"
echo "Deployed commit $COMMIT via $HOST"
echo "Site: https://charlietheboss.com/cosmica/ (or your configured vhost)"
