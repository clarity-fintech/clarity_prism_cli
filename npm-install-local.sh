#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Installing clrt globally from $ROOT ..."
npm install -g "$ROOT"
echo ""
echo "Done. Run: clrt --help"
echo "Or without global install: npm run clrt -- --help"
echo "Or: ./bin/clrt --help"
