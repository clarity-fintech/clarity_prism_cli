# CLRTY PRISM + HELIX

**Version:** `1.0.2.μ1` — Tier 5 Enterprise CLI (chain-native, investor walkthrough, QA exchange hub, wallet + P2P)

**Topic:** Intelligent routing + execution operating system — PRISM decides *what*, HELIX decides *how*, Skills decide *what value*.

Standalone repo: https://github.com/williamsnameiswill/clarity-prism-cli

| Layer | Role | CLI |
|-------|------|-----|
| **PRISM** | Decides *what* should happen — intent, PoR, cache, audit ledger | `clrt prism` |
| **HELIX** | Decides *how* it should happen — routing, MEV protection, execution | `clrt helix` |
| **SKILLS** | Decides *what value* it creates — modular deterministic runtime | `clrt skill` |

**Blockchain integrations:** PRISM connects to clrty-l1 indexer, HELIX shadow state, settlement attestations, and network intelligence via `CLRTY_API_URL` (port **8545**). Local fallback uses in-repo engines + mini-git ledger.

**Query backlog:** Terminal UI and `clrt prism query` process **one prompt at a time** with automatic queueing for additional prompts (`clrt prism queue status`).

**Terminal access gate:** The PRISM terminal UI (`npm run dev:terminal`) is **temporarily unavailable** for general users until public launch. Account creation remains open. Full terminal unlock requires **one of three entitlements** — investor settlement path, Volkov Mastermind First Access pack verify, or approved partner early access — plus an operator admin password override. Set `VITE_PRISM_TERMINAL_PUBLIC=1` to disable the gate for launch.

---

## Documentation

| Guide | Description |
|-------|-------------|
| [docs/ALL_COMMANDS.md](./docs/ALL_COMMANDS.md) | **Every command, flag, and example** (canonical) |
| [docs/QUICKSTART.md](./docs/QUICKSTART.md) | Install and first command in 5 minutes |
| [docs/FULL_USAGE.md](./docs/FULL_USAGE.md) | Complete operational guide |
| [docs/CLI_REFERENCE.md](./docs/CLI_REFERENCE.md) | Every command, flag, and output field |
| [docs/PACKAGES.md](./docs/PACKAGES.md) | All `@clrt/*` SDK APIs |
| [docs/EXAMPLES.md](./docs/EXAMPLES.md) | Copy-paste workflows |
| [docs/ENVIRONMENT.md](./docs/ENVIRONMENT.md) | Configuration variables |
| [DOWNLOADS.md](./DOWNLOADS.md) | Git clone, ZIP bundle, offline install |

---

## Install

### Git clone (full access)

```bash
git clone https://github.com/williamsnameiswill/clarity-prism-cli.git
cd clarity-prism-cli
npm install
npm run build
bash npm-install-local.sh   # puts `clrt` on PATH globally
clrt --help

# Without global install (from repo root):
npm run clrt -- --help
./bin/clrt --help
node apps/cli/dist/index.js --help
```

> **Important:** Run all commands from the repo root (`clarity-prism-cli/`), not from a nested `clarity-prism-cli/clarity-prism-cli/` folder. If you see verify fail on `prism-cli` or version `1.0.1`, you are in the wrong directory — `cd ..` and remove the nested copy: `rm -rf clarity-prism-cli`.

### ZIP bundle

Extract `dist/clarity-prism-full.zip`, then run `bash npm-install-local.sh`.

### Requirements

- Node.js **18+**
- npm **9+**

---

## CLI quick reference

### Visual terminal UI (matches PRISM design)

```bash
# Terminal UI → http://localhost:5174
npm run dev:terminal
npm run build:terminal
```

Output: `apps/prism-cli/dist/`. See [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) if Vite warns about `#` in paths.

### PRISM (purple)

```bash
clrt prism query "arbitrage opportunities"
clrt prism predict --capital=1000
clrt prism cache status
clrt prism validate --intent arbitrage_scan --capital 1000
clrt prism trace -n 20
clrt prism stats
```

### HELIX (blue)

```bash
clrt helix status
clrt helix execute swap --from SOL --to USDC --amount 1000
clrt helix simulate swap --amount 500
clrt helix liquidity scan SOL/USDC
```

### Skills

```bash
clrt skill install market-arbitrage
clrt skill run market-arbitrage --capital 1000 --max-exposure 0.2
clrt skill status
clrt skill locks
```

### Full pipeline

```bash
clrt run "optimize portfolio yield" --capital 5000
```

### Tier 5 (v1.0.2) — account, chain, wallet, P2P

```bash
clrt version
clrt registry
clrt account create --username alice --entity "Acme" --email ops@acme.com --intent liquidity
clrt wallet status
clrt wallet registry
clrt wallet connect --address 0x...
clrt chain ready --json
clrt chain status
clrt prism commons send --to bob --file ./README.md
clrt partner request-access
clrt settlement instructions
clrt exchange list
clrt pack list
clrt prism init
clrt prism commons discover arbitrage
```

Global flags: `--json` · `--dry-run`

---

## Full stack (blockchain + wallet live)

See **[docs/CLI_REFERENCE.md](./docs/CLI_REFERENCE.md)** for every command.

```bash
# Terminal 1 — blockchain API
cd ..   # monorepo root ($CLRTY_PROJECT)
cargo run -p clrty-api

# Terminal 2 — CLI
cd clarity-prism-cli
npm install && npm run build
make live                    # build + ensure API + strict verify + smoke

export CLRTY_API_URL=http://127.0.0.1:8545
clrt chain ready --json
clrt account create --username alice --entity "Acme" --email a@acme.com --intent liquidity
clrt wallet connect --address 0x1234567890123456789012345678901234567890
clrt wallet registry --json
clrt prism commons send --to bob --file ./README.md --json

# Terminal UI (Wallet + Chain panels)
npm run dev:terminal         # http://localhost:5174
```

---

## SDK quick start

```javascript
import { PrismClient } from "@clrt/prism-sdk";
import { PrismHelix } from "@clrt/prism-helix";

const prism = new PrismClient({ network: "mainnet" });
const result = await prism.query({ intent: "portfolio_state", address: "WALLET" });

const pipeline = new PrismHelix();
await pipeline.execute({ intent: "optimize yield", capital: 5000 });
```

---

## Package tree

```
@clrt/prism-core       @clrt/prism-nodes       @clrt/prism-secure
@clrt/prism-models     @clrt/prism-sdk         @clrt/prism-helix
@clrt/helix-core       @clrt/helix-routing     @clrt/helix-protect
@clrt/helix-sim        @clrt/helix-ai
@clrt/skills-sdk       @clrt/skill-marketplace
@clrt/cli              (global `clrt` command)
```

---

## Live API (clrty-api :8545)

```bash
cp .env.example .env
export CLRTY_API_URL=http://127.0.0.1:8545
export CLRTY_API_KEY=your_key
```

Start API from monorepo root: `cargo run -p clrty-api`

Key routes: `/v1/status`, `/v1/wallet/registry`, `/v1/wallet/register`, `/v1/commons/send`, `/v1/prism/account/register`. Falls back to local mode when API is unavailable.

---

## Verify

```bash
make verify       # packages + cross-repo + CLI smoke
make live         # build + ensure clrty-api + strict verify + smoke
make live-verify  # ensure API up, then strict verify
make build-kit    # dist/clarity-prism-full.zip
```

---

## License

MIT
