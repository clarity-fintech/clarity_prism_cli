.PHONY: help verify packages-verify cli-smoke build-kit live live-verify ensure-api

help:
	@echo "CLRTY PRISM + HELIX — full download ecosystem"
	@echo "  make verify       — npm run verify (packages + inventory + cross-repo)"
	@echo "  make live         — build CLI, ensure clrty-api, strict verify + smoke"
	@echo "  make live-verify  — ensure clrty-api up, then strict verify + smoke"
	@echo "  make build-kit    — dist/clarity-prism-full.zip"
	@echo "  make packages-verify"
	@echo "  make cli-smoke"

verify: packages-verify cli-smoke
	@echo OK: full verify passed

ensure-api:
	bash scripts/ensure_api_running.sh

live-verify: ensure-api
	CLRTY_VERIFY_STRICT=1 npm run verify
	bash scripts/cli_smoke.sh

live: build
	npm run build
	$(MAKE) live-verify

build:
	npm run build

packages-verify:
	npm run verify

cli-smoke:
	bash scripts/cli_smoke.sh

build-kit:
	bash scripts/build_kit.sh
