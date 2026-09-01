# GitHub Actions deploy

One-time setup in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `DEPLOY_HOST` | `192.64.87.248` |
| `DEPLOY_USER` | `charlie` |
| `DEPLOY_SSH_KEY` | Contents of `~/.ssh/id_ed25519` (private key, same as Elementra) |

Then either:

- Push to `main` (auto-deploy), or
- **Actions → Deploy Cosmica → Run workflow**

Live URL: **https://charlietheboss.com/cosmica/**
