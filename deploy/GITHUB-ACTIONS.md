# GitHub Actions deploy

**Works from any OS (including Windows)** — no local terminal required after setup.

One-time setup in **GitHub → charlietheboss151/cosmica → Settings → Secrets and variables → Actions**:

| Secret | Value |
|--------|--------|
| `DEPLOY_SSH_KEY` | Private SSH key authorized on `charlie@192.64.87.248` |

Use either:

- **Elementra key** — same key you use for charlietheboss.com deploy. On Windows PowerShell:

  ```powershell
  Get-Content $env:USERPROFILE\.ssh\id_ed25519 -Raw
  ```

  Paste the full output (including `BEGIN` / `END` lines) into the GitHub secret.

- **Cosmica deploy key** — private half of `deploy/cosmica-deploy.pub` (see `deploy/README.md` to authorize on the server).

Then either push to `main` (auto-deploy) or **Actions → Deploy Cosmica → Run workflow**.

Live URL: **https://charlietheboss.com/cosmica/**

If deploy fails with `can't connect without a private SSH key`, the secret is missing. If it fails with `Permission denied`, add the matching public key to `~/.ssh/authorized_keys` on the server.
