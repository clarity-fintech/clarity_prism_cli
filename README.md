# CLRTY PRISM + HELIX

**Version:** `1.0.1.μ1` — Tier 5 Enterprise CLI (chain-native, investor walkthrough, QA exchange hub)

**Topic:** Intelligent routing + execution operating system — PRISM decides *what*, HELIX decides *how*, Skills decide *what value*.

Standalone repo: https://github.com/williamsnameiswill/clarity-prism-cli

| Layer | Role | CLI |
|-------|------|-----|
| **PRISM** | Decides *what* should happen — intent, PoR, cache, audit ledger | `clrt prism` |
| **HELIX** | Decides *how* it should happen — routing, MEV protection, execution | `clrt helix` |
| **SKILLS** | Decides *what value* it creates — modular deterministic runtime | `clrt skill` |

**Blockchain integrations:** PRISM connects to clrty-l1 indexer, HELIX shadow state, settlement attestations, and network intelligence via `CLRTY_API_URL` (port **8545**). Local fallback uses in-repo engines + mini-git ledger.

**Query backlog:** Terminal UI and `clrt prism query` process **one prompt at a time** with automatic queueing for additional prompts (`clrt prism queue status`).

---

## Documentation

| Guide | Description |
|-------|-------------|
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
bash npm-install-local.sh
clrt --help
```

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

### Tier 5 (v1.0.1)

```bash
clrt version
clrt registry
clrt account create --entity "Acme Capital" --email ops@acme.com --intent liquidity
clrt partner request-access
clrt settlement instructions
clrt chain status
clrt exchange list
clrt pack list
clrt prism init
clrt prism commons discover arbitrage
```

Global flags: `--json` · `--dry-run`

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

## Live API (optional)

```bash
cp .env.example .env
export CLRTY_API_URL=http://127.0.0.1:8545
export CLRTY_API_KEY=your_key
```

Endpoints: `POST /v1/prism/intent-aware`, `GET /v1/helix/status`, and more. Falls back to local mode when API is unavailable.

---

## Verify

```bash
make verify    # 14 packages + CLI smoke + ZIP bundle
```

---

## License

MIT
