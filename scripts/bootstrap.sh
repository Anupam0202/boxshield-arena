#!/usr/bin/env bash
set -euo pipefail
for c in java boxlang box install-bx-module; do command -v "$c" >/dev/null || { echo "$c is required" >&2; exit 1; }; done
box install
install-bx-module bx-ai@3.4.0 --local
boxlang --version; box version; install-bx-module --list
