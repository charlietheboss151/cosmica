# GitHub Actions deploy

One-time setup in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `DEPLOY_SSH_KEY` | Full contents of `~/.ssh/id_ed25519` (private key — same as Elementra deploy) |

Then either push to `main` (auto-deploy) or **Actions → Deploy Cosmica → Run workflow**.

Live URL: **https://charlietheboss.com/cosmica/**
