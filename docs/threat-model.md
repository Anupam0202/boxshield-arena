# Threat model

## Assets

- Provider API key and signing key
- Integrity of evaluation results and scores
- Approval boundary around simulated actions
- Public deployment quota and availability
- Confidentiality of synthetic hidden markers
- User trust in mode and evidence labels

## Adversaries

- A user attempting to manipulate the bundled target
- Malicious text embedded in a synthetic document
- A model producing malformed or policy-violating output
- A client tampering with run state, score fields, or approval
- Automated traffic attempting to consume live-model quota

## In scope

Prompt injection, indirect injection, hidden-context disclosure, output exfiltration, excessive agency, approval bypass, unsupported actions, unbounded usage, malformed structured output, HTML injection, capsule tampering, and cost abuse.

## Out of scope in the submitted MVP

Arbitrary remote targets, real action adapters, production customer data, browser automation against third parties, malware, external penetration testing, persistent user accounts, and claims of certification.

## Controls

- Synthetic data and actions
- No arbitrary target URL
- Shallow schemas and semantic validation
- Per-agent sanitizer and output guard
- Context fencing
- Deterministic action allowlist
- Approval-bound nonce
- HMAC-SHA256 capsule integrity
- Expiry checks
- Request and model-call budgets
- Same-origin APIs and output escaping
- Public Replay mode; protected Live mode
- Sanitized logs and fixtures

## Residual risks

Pattern-based guards can miss novel attacks. Model-based judges can be wrong. A single model run is not statistically meaningful. Instance-local rate limits do not provide global distributed enforcement. HMAC does not encrypt a capsule. These limitations are visible in the product and report.
