# Deployment

## Local container

```bash
docker build --pull -t boxshield-arena:local .
docker run --rm -p 8080:8080 -e PORT=8080 -e AI_MODE=replay -e LIVE_MODE_ENABLED=false -e RUN_STATE_SIGNING_KEY="$(openssl rand -hex 32)" boxshield-arena:local
```

## Vercel

Vercel automatically detects `Dockerfile.vercel`. Keep the project root at `.`, then set `RUN_STATE_SIGNING_KEY`, `AI_MODE=replay`, and `LIVE_MODE_ENABLED=false` before deploying. Do not set a provider key or enable Live mode without separate implementation and testing.

After deployment, run:

```bash
export DEPLOYMENT_URL="https://your-project.vercel.app"
curl -fsS "$DEPLOYMENT_URL/api/health.bxm" | jq -e '.ok==true'
./scripts/http-runtime-gate.sh "$DEPLOYMENT_URL"
```

Container availability is plan/account dependent. Pin a tested immutable MiniServer digest before production promotion.
