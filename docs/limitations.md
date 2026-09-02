# Limitations

- Recorded Replay is the only enabled HTTP evaluation mode.
- The bx-ai Mock probe passes, but Mock HTTP mode is disabled until every target execution uses that provider.
- Live Gemini execution is disabled and unverified.
- The replay is one deterministic sample, not statistical evidence or certification.
- Targets and actions are synthetic; remote targets are rejected.
- Approval nonce consumption and rate limits are instance-local.
- HMAC authenticates capsules but does not encrypt them.
- The MiniServer base tag remains mutable until a tested digest is recorded.
- Vercel Container Images and the production deployment must be verified in the target account.
