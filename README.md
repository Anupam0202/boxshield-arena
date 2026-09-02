# BoxShield Arena

BoxShield Arena is a safe, utility-aware red-team evaluator for BoxLang AI agents. It runs a bounded adversarial corpus against a bundled synthetic support target, records deterministic evidence, proposes an allowlisted guardrail patch, requires explicit approval, and replays identical inputs against a hardened clone.

## Verified status

- Recorded Replay is enabled and runtime-verified.
- TestBox: **60 passed, 0 failed, 0 errors, 0 skipped**.
- The bx-ai Mock provider probe passed with one recorded interaction.
- MiniServer evaluate → defend → approve → replay and negative HTTP tests passed.
- Mock HTTP mode remains disabled until its complete target path invokes bx-ai.
- Live Gemini mode remains disabled until credentialed provider testing is complete.

Fixture scores: Full safety **26 → 89**, Full utility **100 → 80**; Quick safety **13 → 100**, Quick utility **100 → 100**. Recorded results are one scripted sample, not a certification.

## Safety boundaries

Only bundled synthetic targets and data are supported. Remote target URLs are rejected, all actions are simulated, defense operations are declarative and allowlisted, signed capsules bind run state, and patches apply only to an approved clone. Deterministic evidence takes precedence over model interpretation.

## Prerequisites

Java 21, BoxLang/MiniServer, CommandBox, TestBox `7.0.0+19`, bx-ai `3.4.0`, Python 3, Node.js 22+, `jq`, `curl`, and `zip`.

## Validate

```bash
./scripts/bootstrap.sh
REQUIRE_BOXLANG=1 ./scripts/test.sh
./scripts/secret-scan.sh
```

## Run locally

```bash
export PORT=8080 AI_MODE=replay LIVE_MODE_ENABLED=false
export RUN_STATE_SIGNING_KEY="$(openssl rand -hex 32)"
boxlang-miniserver miniserver.json --host 0.0.0.0 --port "$PORT" --webroot "$PWD"
```

Then run `./scripts/smoke.sh http://127.0.0.1:8080` and `./scripts/http-runtime-gate.sh http://127.0.0.1:8080`.

## Vercel

Vercel detects the root `Dockerfile.vercel`. Before the first deployment set `RUN_STATE_SIGNING_KEY` to a stable high-entropy secret, `AI_MODE=replay`, and `LIVE_MODE_ENABLED=false` for Preview and Production. See [GitHub and Vercel deployment](docs/GITHUB_AND_VERCEL.md).

The MiniServer base tag is mutable. Resolve and test an immutable digest before a high-assurance production promotion.

## Documentation

- [Architecture](docs/architecture.md)
- [API](docs/API.md)
- [Attack corpus](docs/attack-corpus.md)
- [Evaluation methodology](docs/evaluation-methodology.md)
- [Threat model](docs/threat-model.md)
- [Testing](docs/testing.md)
- [Deployment](docs/deployment.md)
- [Limitations](docs/limitations.md)

Apache-2.0 licensed. See [SECURITY.md](SECURITY.md) for vulnerability reporting.
