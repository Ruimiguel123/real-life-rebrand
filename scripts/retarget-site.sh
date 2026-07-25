#!/usr/bin/env bash
#
# retarget-site.sh
# Real. Life Healing — two find-and-replace passes across the repo:
#
#   1. reallifehealing.info        ->  reallifehealing.care   (apex, no www)
#   2. kelly.daylmhc@gmail.com     ->  kellyday@reallifehealing.care
#
# The email swap is not cosmetic. A free Gmail account carries no Business
# Associate Agreement, and a published address on a therapy website WILL
# receive protected health information whether or not you invite it.
#
# DO NOT RUN THE EMAIL PASS UNTIL THE NEW MAILBOX RECEIVES MAIL.
# Send a test message to kellyday@reallifehealing.care from an outside
# account and confirm it arrives. Publishing an address that bounces means
# losing enquiries silently, which is worse than the problem being fixed.
#
# Usage:
#   ./scripts/retarget-site.sh              # dry run — shows what WOULD change
#   ./scripts/retarget-site.sh --apply      # writes the changes
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
#   kelly.daylmhc@gmail.com           ->  kellyday@reallifehealing.care
#
# The bare-text rules catch display text like the footer label on /links,
# which currently reads "reallifehealing.info" while linking to .care.
# The email rule catches both mailto: hrefs and visible label text, since
# both are the same string.

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
OLD_EMAIL="kelly.daylmhc@gmail.com"
NEW_EMAIL="kellyday@reallifehealing.care"

# Exported so perl can read them via %ENV. Passing them through the
# environment avoids stacking bash quoting on top of perl quoting on top of
# regex escaping — a layer cake that silently produced a pattern matching a
# literal backslash in an earlier version of this script.
export OLD_HOST NEW_HOST OLD_EMAIL NEW_EMAIL

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
  if grep -qF "$OLD_HOST" "$f" 2>/dev/null || grep -qF "$OLD_EMAIL" "$f" 2>/dev/null; then
    matches+=( "$f" )
  fi
done

if [[ ${#matches[@]} -eq 0 ]]; then
  echo "No references to ${OLD_HOST} or ${OLD_EMAIL} found. Nothing to do."
  exit 0
fi

echo "Found ${OLD_HOST} or ${OLD_EMAIL} in ${#matches[@]} file(s):"
echo
for f in "${matches[@]}"; do
  count=$(grep -coE "$(printf '%s|%s' "${OLD_HOST//./\\.}" "${OLD_EMAIL//./\\.}")" "$f")
  printf '  %-60s %s line(s)\n' "$f" "$count"
  grep -nE "$(printf '%s|%s' "${OLD_HOST//./\\.}" "${OLD_EMAIL//./\\.}")" "$f" \
    | sed 's/^/      /' | head -20
  echo
done

if [[ "$APPLY" != true ]]; then
  echo "Dry run. Nothing written."
  echo "Re-run with --apply to make these changes, then review with: git diff"
  exit 0
fi

for f in "${matches[@]}"; do
  perl -pi -e '
    s{\Q$ENV{OLD_EMAIL}\E}{$ENV{NEW_EMAIL}}g;
    s{https?://www\.\Q$ENV{OLD_HOST}\E}{https://$ENV{NEW_HOST}}g;
    s{https?://\Q$ENV{OLD_HOST}\E}{https://$ENV{NEW_HOST}}g;
    s{www\.\Q$ENV{OLD_HOST}\E}{$ENV{NEW_HOST}}g;
    s{\Q$ENV{OLD_HOST}\E}{$ENV{NEW_HOST}}g;
  ' "$f"
done

echo "Rewrote ${#matches[@]} file(s)."
echo
echo "Next:"
echo "  1. git diff                 — read every change before trusting it"
echo "  2. grep -rnE 'reallifehealing[.]info|kelly[.]daylmhc' . \\"
echo "       --exclude-dir=.git --exclude-dir=node_modules --exclude=retarget-site.sh"
echo "     (should return nothing except this script's own comments)"
echo "  3. Build and check the rendered <head> on every route"
