# GitHub and Vercel

## Create and push the repository

```bash
git init -b main
git config user.name "YOUR_GITHUB_NAME"
git config user.email "YOUR_GITHUB_EMAIL"
git add --all
git diff --cached --check
git commit -m "feat: release BoxShield Arena"
gh auth login --hostname github.com --git-protocol https --web
gh repo create boxshield-arena --private --source=. --remote=origin --push
```

Use `--public` only when ready to publish. Without GitHub CLI, create an empty repository in GitHub and run `git remote add origin https://github.com/YOUR_GITHUB_USER/boxshield-arena.git && git push -u origin main`.

## Import into Vercel

Open `https://vercel.com/new`, grant the Vercel GitHub App access to the new repository, import it with root `.`, and confirm that `Dockerfile.vercel` is detected. Before Deploy, add for Preview and Production:

```text
RUN_STATE_SIGNING_KEY=<openssl rand -hex 32 output>
AI_MODE=replay
LIVE_MODE_ENABLED=false
```

Never commit the signing key. After deployment, run the health and HTTP runtime gates from `docs/deployment.md`. Connected Git pushes then create automatic Preview deployments; pushes to the production branch create Production deployments.
