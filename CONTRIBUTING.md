# Contributing

BoxShield Arena welcomes defensive, authorized-use improvements.

1. Keep the bundled target synthetic and deterministic.
2. Add corpus cases only when payloads are safe, versioned, mapped to an observable invariant, and paired with an applicable defense.
3. Never add remote-target URLs, real secrets, credential-shaped samples, or destructive actions.
4. Preserve Replay provenance. Do not label scripted fixtures as Mock or Live.
5. Run `./scripts/test.sh`, `./scripts/secret-scan.sh`, the browser workflow, and ZIP verification.
6. Add TestBox regression cases for changed BoxLang behavior; report them as unrun until actually executed.
7. Update the threat model, limitations, and changelog when trust boundaries or capabilities change.

New target integrations must implement `TargetAdapter`, document owner authorization, enforce network and action allowlists, and undergo a separate threat-model review before they can be enabled.
