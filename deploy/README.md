# Cosmica deploy SSH

One-time setup to deploy Cosmica to the same server as Elementra (`charlie@192.64.87.248`).

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

## 3. Authorize the key on the server

On the server, add the public key to `~/.ssh/authorized_keys` (same account as Elementra):

```bash
# from your machine, if you already have Elementra SSH access:
ssh charlie@192.64.87.248 "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys" < deploy/cosmica-deploy.pub
```

Or paste `deploy/cosmica-deploy.pub` into the server’s `authorized_keys` manually.

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
