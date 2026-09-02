# HTTP API

All responses use `{ ok, requestId, data, error, meta }`, `Cache-Control: no-store`, JSON content type, and same-origin security headers. State-changing requests require bounded `application/json` bodies. Remote target IDs are rejected.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health.bxm` | Safe service status |
| GET | `/api/config.bxm` | Nonsecret capability flags; only Replay is enabled until runtime probes pass |
| GET | `/api/targets.bxm` | Bundled synthetic target manifest |
| POST | `/api/evaluate.bxm` | Freeze a Quick or Full Replay baseline and issue a signed capsule |
| POST | `/api/defend.bxm` | Validate the baseline capsule, validate the recorded declarative patch, rotate the nonce, and issue an approval capsule |
| POST | `/api/replay.bxm` | Require explicit `APPROVE_CLONE_ONLY`, consume the run-bound nonce, verify the patch fingerprint, and return paired replay |
| GET or POST | `/api/report.bxm` | Public sanitized Recorded Replay evidence |

## Replay request sequence

```json
{"suite":"quick","mode":"replay","targetId":"acme-support"}
```

Pass `data.capsule` to `/api/defend.bxm`:

```json
{"capsule":{"payload":{},"signature":"...","algorithm":"HMAC-SHA256"}}
```

After human review, pass the returned approval capsule and nonce to `/api/replay.bxm`:

```json
{"capsule":{"payload":{},"signature":"...","algorithm":"HMAC-SHA256"},"approved":true,"approvalNonce":"...","approvalStatement":"APPROVE_CLONE_ONLY"}
```

Capsules expire after fifteen minutes and are bound to target version, corpus version, ordered attack/control IDs, baseline outcome hashes, provider mode, model ID, patch fingerprint, and stage. Scores are recomputed server-side.

## Mode behavior

- `replay`: available and labeled `RECORDED_REPLAY`.
- `mock`: fails with `MOCK_RUNTIME_UNVERIFIED` until the bx-ai mock integration test passes in the deployed runtime.
- `live`: requires the Live access policy and still fails with `LIVE_RUNTIME_UNVERIFIED` until Gemini-through-bx-ai is proved. It never returns fixture data as Live.
