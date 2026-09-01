#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

HOST="${COSMICA_SSH_HOST:-charlie@charlietheboss.com}"
REMOTE_WEB="${COSMICA_REMOTE_WEB:-~/public_html/cosmica}"
REMOTE_SRC="${COSMICA_REMOTE_SRC:-~/src/cosmica}"
BRANCH="${COSMICA_DEPLOY_BRANCH:-main}"
REMOTE_BUILD="${COSMICA_REMOTE_BUILD:-0}"

SSH_OPTS=(-o BatchMode=yes)
if [ -n "${COSMICA_SSH_IDENTITY:-}" ] && [ -f "$COSMICA_SSH_IDENTITY" ]; then
  SSH_OPTS+=(-i "$COSMICA_SSH_IDENTITY")
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_OPTS+=(-i "$HOME/.ssh/id_ed25519")
elif [ -f "$HOME/.ssh/id_ed25519_cosmica" ]; then
  SSH_OPTS+=(-i "$HOME/.ssh/id_ed25519_cosmica")
fi

ssh_cmd() {
  ssh "${SSH_OPTS[@]}" "$HOST" "$@"
}

if [ "$REMOTE_BUILD" = "1" ]; then
  ssh_cmd bash -s <<EOF
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
else
  npm ci
  npm run build
  ssh_cmd "mkdir -p $REMOTE_WEB"
  rsync -a --delete -e "ssh ${SSH_OPTS[*]}" dist/ "$HOST:$REMOTE_WEB/"
fi

COMMIT="$(git rev-parse --short HEAD)"
echo "Deployed commit $COMMIT to https://charlietheboss.com/cosmica/"
