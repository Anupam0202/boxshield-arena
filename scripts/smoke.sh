#!/usr/bin/env bash
set -euo pipefail
BASE_URL="${1:-http://127.0.0.1:${PORT:-8080}}"
curl --fail --silent --show-error "$BASE_URL/" >/dev/null
curl --fail --silent --show-error "$BASE_URL/api/health.bxm" | python3 -m json.tool >/dev/null
curl --fail --silent --show-error "$BASE_URL/data/replay-v1.json" | python3 -m json.tool >/dev/null
echo "SMOKE-PASS: homepage, health, and replay fixture"
