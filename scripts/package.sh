#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST="$ROOT/dist"
ZIP="$DIST/boxshield-arena.zip"
mkdir -p "$DIST"
rm -f "$ZIP" "$ZIP.sha256"
(
  cd "$ROOT"
  zip -X -qr "$ZIP" . \
    -x '.git/*' '.ai/*' '.env' '.env.local' '.env.*.local' '.vercel/*' \
       'build/*' 'dist/*' 'modules/*' 'boxlang_modules/*' 'testbox/*' 'node_modules/*' \
       '.commandbox/*' '.boxlang/*' 'coverage/*' '*/__pycache__/*' '*.pyc' '*.pyo' \
       '.pytest_cache/*' '*.log' '*.pid' '*.tmp' '*.bak' '*~' '.DS_Store' 'Thumbs.db'
)
"$ROOT/scripts/verify-zip.sh" "$ZIP"
(cd "$DIST" && sha256sum boxshield-arena.zip | tee boxshield-arena.zip.sha256)
