#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/apps/cli/dist/index.js"
export PRISM_REPO_DIR="$ROOT/var/test-prism-repo"
rm -rf "$PRISM_REPO_DIR"
mkdir -p "$PRISM_REPO_DIR"

run() {
  echo ">> node $CLI $*"
  node "$CLI" "$@"
}

run prism query "arbitrage opportunities"
run prism predict --capital=1000
run prism cache status
run prism validate --intent arbitrage_scan --capital 1000
run prism trace -n 5
run prism stats

run helix status
run helix execute swap --from SOL --to USDC --amount 1000
run helix simulate swap --amount 500
run helix liquidity scan SOL/USDC

run skill install market-arbitrage
run skill run market-arbitrage --capital 1000
run skill status
run skill locks

run run "optimize portfolio yield" --capital 5000

echo "OK: CLI smoke passed"
