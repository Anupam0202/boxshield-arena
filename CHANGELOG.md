# Changelog

## 1.1.0 — audited hardening release

- Routed the MiniServer UI through evaluate, defend, and replay APIs while retaining an explicitly labeled static fallback.
- Disabled unverified Mock and Live HTTP modes instead of relabeling Replay fixtures.
- Bound exact baseline hashes, target/corpus versions, patch fingerprint, rotated nonce, and clone-only approval into signed capsules.
- Added typed defense-catalog validation, structured safe logging, Live access policy, expanded oracle checks, and correct utility-retention math.
- Added reproducible payload/output hashes and truthful `SCRIPTED_FIXTURE` provenance.
- Expanded the TestBox inventory to 60 cases and the environment-independent verifier to 500+ checks.
- Added complete API security headers and stronger release/ZIP checks.

## 1.0.0 — hackathon release candidate

- Initial five-stage Recorded Replay experience.
- Safe synthetic target, corpus, scoring, reports, and packaging.
