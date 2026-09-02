# Architecture

BoxShield Arena is a modular BoxLang MiniServer monolith. The production page (`index.bxm`) calls the server for every security-sensitive transition; the static `demo.html` is a separate, explicitly labeled offline Replay fallback.

```text
index.bxm browser
  → POST /api/evaluate.bxm
  → request and target validation
  → exact scripted baseline + server-side score
  → HMAC-SHA256 BASELINE_COMPLETE capsule
  → POST /api/defend.bxm
  → known target/corpus/baseline validation
  → typed DefenseCatalog validation
  → patch fingerprint + rotated nonce
  → signed PATCH_PROPOSED approval capsule
  → human APPROVE_CLONE_ONLY
  → POST /api/replay.bxm
  → signature/stage/patch/nonce validation
  → instance-local nonce consumption
  → exact ordered paired replay
  → server-side Safety + Utility recomputation
```

## Trust boundaries

- Browser input and approval flags are untrusted; signed state and known versions are verified server-side.
- Only `acme-support` is accepted. No arbitrary URL or network target exists.
- Model/fixture output is untrusted and escaped before DOM insertion.
- Defense operations are allowlisted and type/range checked; executable fields are rejected.
- The patch fingerprint and clone-only approval statement are bound to the signed approval capsule.
- Provider keys, access codes, signing key, stack traces, and full capsules are excluded from output/logging.

## Modes

- Replay is the only enabled HTTP mode in this release.
- Mock source and tests exist but remain disabled until bx-ai executes successfully.
- Live applies a fail-closed access policy and remains disabled until Gemini-through-bx-ai is verified.
- No failed mode silently returns Replay data under another label.

## BoxLang AI boundary

Target, Attacker, Defender, and Security Judge builders define bounded structured roles. Gemini tools are not assumed because current bx-ai documentation lists Gemini tool support as in development. Application-level BoxLang owns authorization and HITL. Provider-runtime proof remains an explicit release blocker.
