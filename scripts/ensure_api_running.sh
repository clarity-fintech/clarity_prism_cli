#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MONO="$(cd "$ROOT/.." && pwd)"
API="${CLRTY_API_URL:-http://127.0.0.1:8545}"
API="${API%/}"

if curl -sf "$API/v1/status" >/dev/null 2>&1; then
  echo "OK: clrty-api already running at $API"
  exit 0
fi

echo "Starting clrty-api from $MONO ..."
(
  cd "$MONO"
  cargo run -p clrty-api
) &
API_PID=$!

for _ in $(seq 1 45); do
  if curl -sf "$API/v1/status" >/dev/null 2>&1; then
    echo "OK: clrty-api listening on $API (pid $API_PID)"
    exit 0
  fi
  sleep 1
done

echo "FAIL: clrty-api did not become ready on $API"
kill "$API_PID" 2>/dev/null || true
exit 1
