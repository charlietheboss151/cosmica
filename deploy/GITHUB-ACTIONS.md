# GitHub Actions deploy

One-time setup in **GitHub → charlietheboss151/cosmica → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `DEPLOY_SSH_KEY` | Private SSH key authorized on `charlie@192.64.87.248` |

Use either:

- **Elementra key** — `~/.ssh/id_ed25519` (same key used for Elementra deploy), or
- **Cosmica deploy key** — private half of `deploy/cosmica-deploy.pub` (see `deploy/README.md` to install on the server)

Then either push to `main` (auto-deploy) or **Actions → Deploy Cosmica → Run workflow**.

Live URL: **https://charlietheboss.com/cosmica/**

If deploy fails with `can't connect without a private SSH key`, the secret is missing. If it fails with `Permission denied`, add the matching public key to `~/.ssh/authorized_keys` on the server.
