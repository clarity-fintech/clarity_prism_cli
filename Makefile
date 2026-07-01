.PHONY: help verify packages-verify cli-smoke build-kit live live-verify ensure-api \
	gate-sync gate-password terminal-dev terminal-build launch-prism launch-prism-live launch-prism-local launch-prism-web

help:
	@echo "CLRTY PRISM + HELIX — full download ecosystem"
	@echo "  make verify            — npm run verify (packages + inventory + cross-repo)"
	@echo "  make live              — build CLI, ensure clrty-api, strict verify + smoke"
	@echo "  make live-verify       — ensure clrty-api up, then strict verify + smoke"
	@echo "  make launch-prism       — native shell terminal (full clrt, no browser)"
	@echo "  make launch-prism-web  — optional browser UI dev (:5174)"
	@echo "  make launch-prism-live — build + API + native terminal shell"
	@echo "  make launch-prism-local — offline dev stubs only (no port)"
	@echo "  make gate-sync         — auto-set apps/prism-cli/.env from .env"
	@echo "  make gate-password     — print personal access code (CLRTY_GATE_MASTER)"
	@echo "  make terminal-dev      — alias for launch-prism"
	@echo "  make terminal-build    — sync gate env + production terminal build"
	@echo "  make build-kit         — dist/clarity-prism-full.zip"
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

gate-sync:
	node scripts/sync_gate_env.mjs

gate-password: gate-sync
	npm run clrt -- gate password

terminal-dev: launch-prism-web

terminal-build:
	node scripts/build_terminal.mjs

launch-prism: gate-sync ensure-api
	node scripts/launch_terminal_shell.mjs

launch-prism-web: gate-sync ensure-api
	npm run dev:terminal

launch-prism-local:
	@echo "Offline dev only (VITE_PRISM_LOCAL=1) — use make launch-prism for port-fed terminal"
	VITE_PRISM_LOCAL=1 npm run dev -w prism-cli

launch-prism-live:
	npm run launch:prism:live

packages-verify:
	npm run verify

cli-smoke:
	bash scripts/cli_smoke.sh

build-kit:
	bash scripts/build_kit.sh
