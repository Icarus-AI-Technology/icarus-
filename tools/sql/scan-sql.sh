#!/usr/bin/env bash
set -euo pipefail
ROOT="${1:-.}"
echo "SQL scan em: $ROOT"
find "$ROOT" -type f -name "*.sql" | sort | sed 's/^/  • /'
