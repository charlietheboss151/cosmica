#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${COSMICA_SSH_HOST:-charlie@192.64.87.248}"
if [ -n "${COSMICA_SSH_IDENTITY:-}" ]; then
  SSH_ID="$COSMICA_SSH_IDENTITY"
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_ID="$HOME/.ssh/id_ed25519"
elif [ -f "$HOME/.ssh/id_ed25519_cosmica" ]; then
  SSH_ID="$HOME/.ssh/id_ed25519_cosmica"
else
  SSH_ID=""
fi
BRANCH="${COSMICA_DEPLOY_BRANCH:-main}"
REMOTE_SRC="${COSMICA_REMOTE_SRC:-~/src/cosmica}"
REMOTE_WEB="${COSMICA_REMOTE_WEB:-~/public_html/cosmica}"

SSH_OPTS=(-o BatchMode=yes)
if [ -n "$SSH_ID" ] && [ -f "$SSH_ID" ]; then
  SSH_OPTS+=(-i "$SSH_ID")
fi

ssh "${SSH_OPTS[@]}" "$HOST" bash -s <<EOF
set -euo pipefail
export NVM_DIR="\$HOME/.nvm"
# shellcheck disable=SC1090
[ -s "\$NVM_DIR/nvm.sh" ] && . "\$NVM_DIR/nvm.sh"
mkdir -p "$REMOTE_SRC" "$REMOTE_WEB"
if [ ! -d "$REMOTE_SRC/.git" ]; then
  git clone https://github.com/charlietheboss151/cosmica.git "$REMOTE_SRC"
fi
cd "$REMOTE_SRC"
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
npm ci
npm run build
rsync -a --delete dist/ "$REMOTE_WEB/"
EOF

COMMIT="$(git rev-parse --short HEAD)"
echo "Deployed commit $COMMIT to https://charlietheboss.com/cosmica/"
