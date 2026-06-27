#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "Installing @clrt/cli globally from local workspace..."
npm install -g "$ROOT/apps/cli"
echo "Done. Run: clrt --help"
