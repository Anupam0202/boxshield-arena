# Testing

Verified locally with BoxLang `1.17.1+59`, TestBox `7.0.0+19`, and bx-ai `3.4.0+18`: 60 TestBox cases passed, the Mock provider recorded one interaction, and the complete MiniServer Replay and negative-input gates passed.

Run after every clean clone:

```bash
./scripts/bootstrap.sh
REQUIRE_BOXLANG=1 ./scripts/test.sh
./scripts/secret-scan.sh
```

Start MiniServer with a stable process signing key, then run `scripts/smoke.sh` and `scripts/http-runtime-gate.sh`. The HTTP gate covers health, configuration, target discovery, evaluation, patch proposal, wrong/reused nonce rejection, explicit approval, exact replay, capsule tampering, report scores, wrong methods and MIME types, malformed JSON, and the body-size limit.
