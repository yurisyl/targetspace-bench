#!/usr/bin/env bash
# Verify the production deployment matches the canonical local build.
# Usage: ./scripts_verify_deploy.sh [origin]   (default https://targetspace.org)
set -u
ORIGIN="${1:-https://targetspace.org}"
fail=0
check() { if [ "$2" = "$3" ]; then echo "OK   $1"; else echo "FAIL $1  (expected $3, got $2)"; fail=1; fi }

# 1. PDF hash: deployed vs canonical local asset
LOCAL_PDF="assets/targetspace-paper-v1.0-final.pdf"
LOCAL_HASH=$(shasum -a 256 "$LOCAL_PDF" | awk '{print $1}')
REMOTE_HASH=$(curl -fsSL "$ORIGIN/assets/targetspace-paper-v1.0-final.pdf" | shasum -a 256 | awk '{print $1}')
check "paper PDF hash matches canonical build" "$REMOTE_HASH" "$LOCAL_HASH"

# 2. Key routes reachable
for p in / /industry /observation-science /hardware /research /protocol /product-quickstart /paper /governance /faq; do
  code=$(curl -fsSL -o /dev/null -w '%{http_code}' "$ORIGIN$p")
  check "route $p" "$code" "200"
done

# 3. Status line present on homepage
if curl -fsSL "$ORIGIN/" | grep -q "Synthetic harness only. No human-subject results"; then
  echo "OK   pre-pilot status line on homepage"
else echo "FAIL pre-pilot status line missing on homepage"; fail=1; fi

# 4. FAQ API serves the corrected world-model answer
if curl -fsSL "$ORIGIN/api/faq" | grep -q "A forecasting benchmark"; then
  echo "OK   production FAQ carries corrected world-model answer"
else echo "FAIL production FAQ not updated (run: npx wrangler d1 execute targetspace --remote --file=./seed_faq_only.sql)"; fail=1; fi

exit $fail
