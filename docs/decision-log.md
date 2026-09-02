# Decision log

1. **Select Challenge 05 and BoxShield Arena.** Best risk-adjusted fit for visible BoxLang AI capabilities, deterministic demo value, and community reuse.
2. **One modular monolith.** Avoid frontend and service sprawl under a hackathon deadline.
3. **No remote target in MVP.** Eliminates SSRF, authorization ambiguity, and accidental third-party testing.
4. **Structured actions over required provider tools.** Preserves tool-abuse testing across provider capability gaps.
5. **Deterministic oracle before judge.** Security claims require observable evidence.
6. **Freeze before defense.** Prevents an unfair before/after comparison.
7. **Track utility independently.** Prevents refuse-everything score gaming.
8. **Declarative shield.** No model-generated executable patch is applied.
9. **Application-level approval.** Critical HITL does not depend on Gemini tool support.
10. **Non-streaming security output.** Post-response guards cannot recall streamed chunks.
11. **Signed stateless capsules.** Compatible with scale-to-zero serverless containers.
12. **Replay is a first-class mode.** The demo remains honest and functional without provider quota.

## 2026-09-02 — independent release audit

- Relabeled the evidence source from unverified `MOCK_PROVIDER` to truthful `SCRIPTED_FIXTURE`.
- Disabled Mock and Live HTTP paths until real provider probes pass.
- Chose server-bound capsule/patch/approval integrity over a browser-only approval claim.
- Expanded deterministic verification instead of fabricating unavailable BoxLang, TestBox, OCI, GitHub, or Vercel results.
