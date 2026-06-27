#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist/clarity-prism-full.zip"
STAGE="$ROOT/var/staging/full-bundle"
rm -rf "$STAGE" "$OUT"
mkdir -p "$STAGE" "$(dirname "$OUT")" "$ROOT/var/compliance"

npm run build --prefix "$ROOT"

for dir in packages apps portal docs assets scripts; do
  cp -R "$ROOT/$dir" "$STAGE/" 2>/dev/null || true
done
for f in README.md DOWNLOADS.md Makefile package.json tsconfig.base.json .env.example npm-install-local.sh; do
  cp "$ROOT/$f" "$STAGE/" 2>/dev/null || true
done

(cd "$STAGE" && zip -rq "$OUT" .)

python3 - "$OUT" << 'PY'
import hashlib, json, sys
from pathlib import Path
p = Path(sys.argv[1])
report = {
    "kit": {"name": "clarity-prism-full", "file": p.name, "sha256": hashlib.sha256(p.read_bytes()).hexdigest()},
    "status": "built",
}
comp = p.parents[1] / "var" / "compliance" / "prism_bundle_report.json"
comp.parent.mkdir(parents=True, exist_ok=True)
comp.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
PY

echo "Full bundle: $OUT"
