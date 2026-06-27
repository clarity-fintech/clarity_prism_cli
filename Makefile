.PHONY: help verify packages-verify cli-smoke build-kit

help:
	@echo "CLRTY PRISM + HELIX — full download ecosystem"
	@echo "  make verify       — packages + CLI smoke + ZIP"
	@echo "  make build-kit    — dist/clarity-prism-full.zip"
	@echo "  make packages-verify"
	@echo "  make cli-smoke"

verify: packages-verify cli-smoke build-kit
	@test -f dist/clarity-prism-full.zip
	@echo OK: full verify passed

packages-verify:
	node scripts/verify_packages.mjs

cli-smoke:
	bash scripts/cli_smoke.sh

build-kit:
	bash scripts/build_kit.sh
