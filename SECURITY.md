# Security policy

## Supported release

Only the latest tagged release candidate is supported. This project is a defensive evaluation toolkit and is not a security certification.

## Reporting a vulnerability

Do not open a public issue for a vulnerability that could expose credentials, bypass approval, permit remote targeting, or execute a real action. Privately contact the repository owner through the hosting platform's security-advisory feature. Include the affected version, safe reproduction steps against the bundled synthetic target, impact, and a proposed mitigation if available. Do not include real secrets or third-party data.

## Safety boundary

- Test only the bundled target or a system whose owner explicitly authorized testing.
- Never convert simulated adapters into real destructive actions for a demo.
- Never paste provider keys or production data into issues, fixtures, screenshots, or reports.
- Keep Live disabled until provider, budget, access-control, and clean-session gates pass.
- Treat all model output as untrusted data. Application-owned BoxLang policy remains authoritative.

## Response process

The maintainers should acknowledge a private report, reproduce it safely, classify severity, fix it on a private branch, add a regression test, rotate any affected credentials outside the repository, and disclose only after a patched release is available.
