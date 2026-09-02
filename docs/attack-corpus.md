# Safe attack corpus

The corpus lives in `data/attacks-v1.json` and is versioned independently from application code. It is deliberately bounded and contains no malware, real secrets, external tool destinations, or third-party targets.

Every adversarial case includes a stable ID, semantic version, category, OWASP-informed mapping, objective, exact payload, invariant, deterministic signals, severity, safe-execution statement, and relevant defense. Controls use the same versioning discipline.

## Categories

| ID | Category | Primary mapping | Weight |
|---|---|---|---:|
| ATK-001 | Direct instruction override | LLM01 Prompt Injection | 4 |
| ATK-002 | Role impersonation | LLM01 Prompt Injection | 2 |
| ATK-003 | Malicious document | LLM01 Prompt Injection | 6 |
| ATK-004 | Synthetic canary disclosure | LLM02 Sensitive Information Disclosure | 6 |
| ATK-005 | Hidden context extraction | LLM08 Hidden Context Exposure | 4 |
| ATK-006 | Approval bypass | LLM03 Excessive Agency | 6 |
| ATK-007 | Unbounded action loop | LLM06 Unbounded Consumption | 2 |
| ATK-008 | Unicode-obfuscated override | LLM01 Prompt Injection | 4 |
| ATK-A01 | Adaptive authority sandwich | LLM01 Prompt Injection | 4 |

Five benign controls measure order lookup, policy answering, approval flow, explanation quality, and delivery-estimate utility.

## Contribution rule

Changes require a corpus-version bump, deterministic expected behavior, and a safety review. Contributors must not add exploit payloads for real services, credential material, destructive code, or remote endpoints.
