# Cosmica deploy SSH

Deploy Cosmica to the same server as Elementra (`charlie@charlietheboss.com`).

The default deploy path builds locally and rsyncs `dist/` to `~/public_html/cosmica/`. Set `COSMICA_REMOTE_BUILD=1` to build on the server instead (git pull + npm ci + build there).

## Deploy from Windows

You do **not** need a Mac. Use **Git Bash** (installed with [Git for Windows](https://git-scm.com/download/win)) or **WSL**:

```bash
cd /c/path/to/cosmica
npm install
npm run deploy
```

Put your private key at `C:\Users\You\.ssh\id_ed25519` (OpenSSH) or set:

```bash
export COSMICA_SSH_IDENTITY="$HOME/.ssh/id_ed25519"
```

In **PowerShell**, OpenSSH one-liner test:

```powershell
ssh -i $env:USERPROFILE\.ssh\id_ed25519 charlie@192.64.87.248 "echo ok"
```

## 1. Install the SSH key (your machine)

The **public** key is in this repo:

```text
deploy/cosmica-deploy.pub
```

The matching **private** key should live at:

```text
~/.ssh/id_ed25519_cosmica
```

If you generated the key elsewhere, copy both files to those paths and run:

```bash
chmod 600 ~/.ssh/id_ed25519_cosmica
```

## 2. SSH config

Append `deploy/ssh-config.example` to `~/.ssh/config`, then test:

```bash
ssh cosmica 'echo ok'
```

## 3. Authorize the key on the server (one-time)

The deploy key must be in `~/.ssh/authorized_keys` on the server. From **Windows PowerShell** or **Git Bash**, if you already SSH in with your Elementra key:

```bash
ssh charlie@charlietheboss.com "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys" < deploy/cosmica-deploy.pub
```

Or paste `deploy/cosmica-deploy.pub` into the server’s `authorized_keys` manually.

Test:

```bash
ssh -i ~/.ssh/id_ed25519_cosmica charlie@charlietheboss.com "echo ok"
```

Optional GitHub Actions deploy: see [`deploy/GITHUB-ACTIONS.md`](GITHUB-ACTIONS.md).

## 4. First deploy on the server

```bash
ssh cosmica 'bash -s' < deploy/server-setup.sh
```

This clones the repo to `~/src/cosmica` and publishes the build to `~/public_html/cosmica/`.

## 5. Later deploys

From the project root:

```bash
npm run deploy
```

Or:

```bash
./scripts/deploy.sh
```

Override paths with `COSMICA_REMOTE_SRC`, `COSMICA_REMOTE_WEB`, or `COSMICA_SSH_HOST` if needed.

## Subpath note

If Cosmica is served from `/cosmica/` on the main site, set `base: '/cosmica/'` in `vite.config.ts` before building for production.
