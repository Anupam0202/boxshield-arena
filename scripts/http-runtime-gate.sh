#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
E="$ROOT/build/evidence"
BASE="${1:-http://127.0.0.1:${PORT:-8080}}"
mkdir -p "$E"
fail(){ echo "HTTP-RUNTIME-GATE-FAIL: $*" >&2; exit 1; }
status(){ [[ "$2" == "$1" ]] || fail "$3 returned $2, expected $1"; echo "$3 HTTP-$2-PASS"; }

curl -fsS "$BASE/api/health.bxm" >"$E/health.json"
jq -e '.ok==true and .data.status=="ok"' "$E/health.json" >/dev/null
curl -fsS "$BASE/api/config.bxm" >"$E/config.json"
jq -e '.ok==true and .data.modes.replay==true and .data.modes.mock==false and .data.modes.live==false and .data.signingKeyIsEphemeral==false' "$E/config.json" >/dev/null
curl -fsS "$BASE/api/targets.bxm" >"$E/targets.json"
jq -e '.ok==true and any(.data.targets[];.id=="acme-support" and .synthetic==true)' "$E/targets.json" >/dev/null

curl -fsS -X POST "$BASE/api/evaluate.bxm" -H 'Content-Type: application/json' --data-binary '{"suite":"quick","mode":"replay","targetId":"acme-support"}' >"$E/evaluate.json"
jq -e '.ok==true and .data.mode=="RECORDED_REPLAY" and .data.score.safetyScore==13 and .data.score.utilityScore==100 and (.data.baseline|length)==7' "$E/evaluate.json" >/dev/null
CAPSULE="$(jq -c '.data.capsule' "$E/evaluate.json")"

jq -nc --argjson capsule "$CAPSULE" '{capsule:$capsule}' | curl -fsS -X POST "$BASE/api/defend.bxm" -H 'Content-Type: application/json' --data-binary @- >"$E/defend.json"
jq -e '.ok==true and .data.applied==false and .data.sourceMode=="SCRIPTED_FIXTURE"' "$E/defend.json" >/dev/null
APP="$(jq -c '.data.approvalCapsule' "$E/defend.json")"; NONCE="$(jq -r '.data.approvalNonce' "$E/defend.json")"
WRONG="${NONCE%?}0"; [[ "$WRONG" != "$NONCE" ]] || WRONG="${NONCE%?}1"

CODE="$(jq -nc --argjson capsule "$APP" --arg nonce "$WRONG" '{capsule:$capsule,approved:true,approvalNonce:$nonce,approvalStatement:"APPROVE_CLONE_ONLY"}' | curl -sS -X POST "$BASE/api/replay.bxm" -H 'Content-Type: application/json' --data-binary @- -o "$E/wrong-nonce.json" -w '%{http_code}')"
status 400 "$CODE" WRONG-NONCE
jq -e '.ok==false and .error.code=="APPROVAL_REQUIRED"' "$E/wrong-nonce.json" >/dev/null

jq -nc --argjson capsule "$APP" --arg nonce "$NONCE" '{capsule:$capsule,approved:true,approvalNonce:$nonce,approvalStatement:"APPROVE_CLONE_ONLY"}' | curl -fsS -X POST "$BASE/api/replay.bxm" -H 'Content-Type: application/json' --data-binary @- >"$E/replay.json"
jq -e '.ok==true and .data.appliedTo=="hardened-clone" and .data.productionActionsExecuted==false and .data.report.patch.status=="APPLIED_TO_CLONE" and .data.report.scores.baselineSafety==13 and .data.report.scores.hardenedSafety==100 and .data.report.scores.safetyDelta==87 and .data.report.scores.utilityRetention==100 and .data.report.scores.regressions==0' "$E/replay.json" >/dev/null
echo REPLAY-QUICK-SCORES-PASS

CODE="$(jq -nc --argjson capsule "$APP" --arg nonce "$NONCE" '{capsule:$capsule,approved:true,approvalNonce:$nonce,approvalStatement:"APPROVE_CLONE_ONLY"}' | curl -sS -X POST "$BASE/api/replay.bxm" -H 'Content-Type: application/json' --data-binary @- -o "$E/reused-nonce.json" -w '%{http_code}')"
status 400 "$CODE" REUSED-NONCE
jq -e '.ok==false and .error.code=="APPROVAL_REPLAYED"' "$E/reused-nonce.json" >/dev/null

BAD="$(printf '%s' "$CAPSULE" | jq -c '.signature="AAAA"')"
CODE="$(jq -nc --argjson capsule "$BAD" '{capsule:$capsule}' | curl -sS -X POST "$BASE/api/defend.bxm" -H 'Content-Type: application/json' --data-binary @- -o "$E/invalid-capsule.json" -w '%{http_code}')"
status 400 "$CODE" INVALID-CAPSULE
jq -e '.ok==false and .error.code=="INVALID_CAPSULE"' "$E/invalid-capsule.json" >/dev/null

curl -fsS "$BASE/api/report.bxm" >"$E/report.json"
jq -e '.ok==true and .data.report.scores.baselineSafety==26 and .data.report.scores.hardenedSafety==89 and .data.report.scores.safetyDelta==63 and .data.report.scores.baselineUtility==100 and .data.report.scores.hardenedUtility==80 and .data.report.scores.utilityRetention==80' "$E/report.json" >/dev/null
echo FULL-REPORT-SCORES-PASS

CODE="$(curl -sS -o "$E/method.json" -w '%{http_code}' "$BASE/api/evaluate.bxm")"; status 405 "$CODE" METHOD-GATE
CODE="$(curl -sS -X POST "$BASE/api/evaluate.bxm" -H 'Content-Type: text/plain' --data-binary '{}' -o "$E/content-type.json" -w '%{http_code}')"; status 400 "$CODE" CONTENT-TYPE-GATE
CODE="$(curl -sS -X POST "$BASE/api/evaluate.bxm" -H 'Content-Type: application/json' --data-binary '{not-json' -o "$E/malformed.json" -w '%{http_code}')"; status 400 "$CODE" MALFORMED-JSON-GATE
python3 - <<'PY' >"$E/oversized-request.json"
print('{"pad":"'+('x'*262145)+'"}')
PY
CODE="$(curl -sS -X POST "$BASE/api/evaluate.bxm" -H 'Content-Type: application/json' --data-binary @"$E/oversized-request.json" -o "$E/oversized.json" -w '%{http_code}')"; rm -f "$E/oversized-request.json"; status 413 "$CODE" OVERSIZED-BODY-GATE

echo REPLAY-APPROVAL-WORKFLOW-PASS
echo HTTP-NEGATIVE-TESTS-PASS
echo HTTP-RUNTIME-GATE-PASS
