#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(pwd)
SRC_DIR="$1"
if [ -z "${SRC_DIR:-}" ]; then
  echo "Uso: $0 src" >&2
  exit 1
fi

shopt -s nullglob

tmpfile=$(mktemp)

# Coleta imports com alias @/
grep -RhoE "from ['\"]@/[^'\"]+['\"]|import\(['\"]@/[^'\"]+['\"]\)" "$SRC_DIR" \
  | sed -E "s/.*['\"](@\/[^'\"]+)['\"].*/\1/" \
  | sort -u > "$tmpfile"

missing=0
echo "\n🔎 Verificando imports com alias @/* ausentes...\n"

while IFS= read -r alias; do
  rel="${alias#@/}"
  base="$ROOT_DIR/src/$rel"

  candidates=(
    "$base.ts" "$base.tsx" "$base.js" "$base.jsx" "$base.mjs" "$base.cjs" "$base.d.ts"
    "$base/index.ts" "$base/index.tsx" "$base/index.js" "$base/index.jsx" "$base/index.d.ts"
  )

  found=0
  for f in "${candidates[@]}"; do
    if [ -e "$f" ]; then
      found=1; break
    fi
  done

  if [ $found -eq 0 ]; then
    echo "❌ Missing: $alias  -> expected under src/$rel"
    missing=$((missing+1))
  fi
done < "$tmpfile"

rm -f "$tmpfile"

if [ $missing -eq 0 ]; then
  echo "\n✅ Nenhum import com alias @/* faltando."
else
  echo "\n⚠️  Total faltando: $missing"
  exit 2
fi


