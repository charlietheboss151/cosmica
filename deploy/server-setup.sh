#!/usr/bin/env bash
# Run once on the web server (as charlie), after adding deploy/cosmica-deploy.pub
# to ~/.ssh/authorized_keys:
#
#   ssh charlie@192.64.87.248 'bash -s' < deploy/server-setup.sh

set -euo pipefail

REPO="${COSMICA_REPO:-git@github.com:charlietheboss151/cosmica.git}"
SRC="${COSMICA_REMOTE_SRC:-$HOME/src/cosmica}"
WEB="${COSMICA_REMOTE_WEB:-$HOME/public_html/cosmica}"

mkdir -p "$HOME/src" "$WEB"

if [ ! -d "$SRC/.git" ]; then
  git clone "$REPO" "$SRC"
fi

export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

cd "$SRC"
git pull --ff-only origin main
npm ci
npm run build
rsync -a --delete dist/ "$WEB/"

echo "Cosmica server setup complete."
echo "Web root: $WEB"
