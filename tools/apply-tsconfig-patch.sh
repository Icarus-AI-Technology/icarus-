#!/usr/bin/env bash
set -euo pipefail

IN_FILE=${1:-tsconfig.json}
PATCH_FILE=${2:-tsconfig.patch.json}
OUT_FILE=${3:-tsconfig.json}

NODE_BIN=${NODE_BIN:-node}

$NODE_BIN "$(dirname "$0")/apply-tsconfig-patch.mjs" --in "$IN_FILE" --patch "$PATCH_FILE" --out "$OUT_FILE"


