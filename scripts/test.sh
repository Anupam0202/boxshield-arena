#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; EVIDENCE="$ROOT/build/evidence"; mkdir -p "$EVIDENCE"
python3 "$ROOT/scripts/verify_project.py"
if ! command -v boxlang >/dev/null 2>&1; then
  [[ "${REQUIRE_BOXLANG:-0}" != 1 ]] && { echo "BOX-RUNTIME-SKIP: BoxLang unavailable."; exit 0; }
  echo "BOX-RUNTIME-FAIL: BoxLang is required." >&2; exit 1
fi
command -v jq >/dev/null || { echo "jq is required" >&2; exit 1; }
set +e; (cd "$ROOT" && boxlang run-tests-mintext.bxs) 2>&1 | tee "$EVIDENCE/testbox-runtime.txt"; rc=${PIPESTATUS[0]}; set -e
[[ $rc -eq 0 ]] && grep -Fq '[Passed: 60] [Failed: 0] [Errors: 0] [Skipped: 0]' "$EVIDENCE/testbox-runtime.txt" && ! grep -Fq '] [ERROR]' "$EVIDENCE/testbox-runtime.txt" || { echo TESTBOX-FAIL >&2; exit 1; }
echo TESTBOX-60-PASS
set +e; (cd "$ROOT" && boxlang run-mock-pipeline.bxs) 2>&1 | tee "$EVIDENCE/bx-ai-mock-runtime.txt"; rc=${PIPESTATUS[0]}; set -e
j="$(grep -E '^\{.*\}$' "$EVIDENCE/bx-ai-mock-runtime.txt" | tail -n1 || true)"
[[ $rc -eq 0 ]] && printf '%s\n' "$j" | jq -e '.mode=="MOCK_PROVIDER" and .recorded>=1' >/dev/null || { echo BX-AI-MOCK-FAIL >&2; exit 1; }
echo BX-AI-MOCK-PASS; echo BOXSHIELD-LOCAL-TEST-GATE-PASS
