#!/usr/bin/env bash
#
# retarget-domain.sh
# Real. Life Healing — repoint every hardcoded reallifehealing.info URL
# to the apex reallifehealing.care.
#
# Usage:
#   ./scripts/retarget-domain.sh              # dry run — shows what WOULD change
#   ./scripts/retarget-domain.sh --apply      # writes the changes
#
# Run it from the repo root, on a clean branch, with everything committed.
# Review `git diff` before you push. This script does not commit anything.
#
# What it rewrites, in this order (order matters — www variants first, or the
# bare-domain rule would leave orphaned "www." prefixes behind):
#
#   https://www.reallifehealing.info  ->  https://reallifehealing.care
#   http://www.reallifehealing.info   ->  https://reallifehealing.care
#   https://reallifehealing.info      ->  https://reallifehealing.care
#   http://reallifehealing.info       ->  https://reallifehealing.care
#   www.reallifehealing.info          ->  reallifehealing.care   (bare text)
#   reallifehealing.info              ->  reallifehealing.care   (bare text)
#
# The last two catch display text like the footer label on /links, which
# currently reads "reallifehealing.info" while linking to .care.

set -euo pipefail

APPLY=false
if [[ "${1:-}" == "--apply" ]]; then
  APPLY=true
elif [[ -n "${1:-}" ]]; then
  echo "Unknown argument: $1" >&2
  echo "Usage: $0 [--apply]" >&2
  exit 1
fi

OLD_HOST="reallifehealing.info"
NEW_HOST="reallifehealing.care"

# Directories and files that must never be touched.
EXCLUDE_DIRS=(
  ".git" "node_modules" "dist" "build" ".wrangler" ".output"
  ".vercel" ".next" "coverage" ".cache"
)
EXCLUDE_FILES=(
  "package-lock.json" "pnpm-lock.yaml" "yarn.lock" "bun.lockb"
)

# This script documents both hostnames in its own comments. Without this it
# would happily rewrite itself and lose the record of what it does.
SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"

# Build the find(1) prune expression.
prune_args=()
for d in "${EXCLUDE_DIRS[@]}"; do
  prune_args+=( -name "$d" -o )
done
unset 'prune_args[${#prune_args[@]}-1]'  # drop trailing -o

mapfile -t candidates < <(
  find . \( "${prune_args[@]}" \) -prune -o -type f -print \
  | while read -r f; do
      base="$(basename "$f")"
      [[ "$(cd "$(dirname "$f")" && pwd)/$base" == "$SELF" ]] && continue
      for skip in "${EXCLUDE_FILES[@]}"; do
        [[ "$base" == "$skip" ]] && continue 2
      done
      # Text files only — never rewrite bytes inside an image or font.
      if file --mime-encoding -b "$f" | grep -qv binary; then
        echo "$f"
      fi
    done
)

matches=()
for f in "${candidates[@]}"; do
  if grep -qF "$OLD_HOST" "$f" 2>/dev/null; then
    matches+=( "$f" )
  fi
done

if [[ ${#matches[@]} -eq 0 ]]; then
  echo "No references to ${OLD_HOST} found. Nothing to do."
  exit 0
fi

echo "Found ${OLD_HOST} in ${#matches[@]} file(s):"
echo
for f in "${matches[@]}"; do
  count=$(grep -coF "$OLD_HOST" "$f")
  printf '  %-60s %s occurrence(s)\n' "$f" "$count"
  grep -nF "$OLD_HOST" "$f" | sed 's/^/      /' | head -20
  echo
done

if [[ "$APPLY" != true ]]; then
  echo "Dry run. Nothing written."
  echo "Re-run with --apply to make these changes, then review with: git diff"
  exit 0
fi

for f in "${matches[@]}"; do
  perl -pi -e "
    s{https?://www\.\Qreallifehealing.info\E}{https://reallifehealing.care}g;
    s{https?://\Qreallifehealing.info\E}{https://reallifehealing.care}g;
    s{www\.\Qreallifehealing.info\E}{reallifehealing.care}g;
    s{\Qreallifehealing.info\E}{reallifehealing.care}g;
  " "$f"
done

echo "Rewrote ${#matches[@]} file(s)."
echo
echo "Next:"
echo "  1. git diff                 — read every change before trusting it"
echo "  2. grep -rn 'reallifehealing.info' . --exclude-dir=.git --exclude-dir=node_modules"
echo "     (should return nothing except this script's own comments)"
echo "  3. Build and check the rendered <head> on every route"
