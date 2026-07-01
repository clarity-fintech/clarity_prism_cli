# CLI Reference — Complete Command Guide

> **Canonical command list:** [ALL_COMMANDS.md](./ALL_COMMANDS.md) — every `clrt` command, flag, and copy-paste example (v1.0.2.μ1).

Global binary: **`clrt`**  
Version: **1.0.2.μ1** (micro counter increments on each CLI reprep within a patch)

```bash
clrt --help
clrt --version          # prints 1.0.2.μ1
clrt version            # release notes + primitive count
clrt version --json
clrt <command> --help
```

**Global flags:** `--json` · `--dry-run`

---

## Full stack — start blockchain + CLI (copy-paste)

Run from the **monorepo** and **prism-cli repo root** (never `clarity-prism-cli/clarity-prism-cli/`).

### Terminal 1 — blockchain API (required for live mode)

```bash
cd /Users/william/\$CLRTY_PROJECT
cargo run -p clrty-api
# → clrty-api listening on http://127.0.0.1:8545/
```

Or auto-start if not running:

```bash
cd clarity-prism-cli
bash scripts/ensure_api_running.sh
```

### Terminal 2 — build, verify, and run CLI

```bash
cd /Users/william/\$CLRTY_PROJECT/clarity-prism-cli
npm install
npm run build

# One-shot: build + ensure API + strict verify + smoke
make live

# Or step-by-step:
make live-verify          # ensure API + CLRTY_VERIFY_STRICT=1 verify + smoke
make verify               # packages + cross-repo + smoke (API optional)
CLRTY_VERIFY_STRICT=1 npm run verify   # fail if API endpoints unreachable

# Global install (optional)
bash npm-install-local.sh
# Without global install:
npm run clrt -- <command>
./bin/clrt <command>
```

### Environment

```bash
export CLRTY_API_URL=http://127.0.0.1:8545
export CLRTY_API_KEY=your_key          # if required
export CLRTY_VERIFY_STRICT=1           # strict cross-repo verify
export CLRTY_API_STRICT=1              # exit 1 on chain ready failure
```

### Live API endpoints (clrty-api :8545)

| Endpoint | Method | Used by |
|----------|--------|---------|
| `/v1/status` | GET | `clrt chain status`, `chain ready` |
| `/v1/indexer/clrty-l1` | GET | `clrt chain indexer` |
| `/v1/sets/:wallet` | GET | `clrt chain sets` |
| `/v1/dx/primitives` | GET | `clrt chain dx list`, `chain ready` |
| `/v1/dx/parse` | POST | `clrt chain dx parse` |
| `/v1/dx/execute` | POST | `clrt chain dx execute`, `chain transfer` |
| `/v1/sim/events` | GET | `clrt chain simulate` |
| `/v1/wallet/registry` | GET | `clrt wallet registry` |
| `/v1/wallet/nodes` | GET | `clrt wallet nodes` |
| `/v1/wallet/register` | POST | `clrt wallet connect` |
| `/v1/wallet/balance/:wallet` | GET | `clrt wallet balance`, terminal WalletPanel |
| `/v1/prism/account/register` | POST | `clrt account create` |
| `/v1/account/status` | GET | terminal UI account probe |
| `/v1/commons/send` | POST | `clrt prism commons send` |
| `/v1/commons/inbox/:user` | GET | `clrt prism commons inbox` |
| `/v1/compliance/*` | GET/POST | `clrt settlement *` |

---

## End-to-end live workflow (all commands)

```bash
# ── 0. Preflight ─────────────────────────────────────────────
curl -s http://127.0.0.1:8545/v1/status | jq .
clrt chain ready --json
clrt version --json
clrt registry --json

# ── 1. Account (username P2P identity) ───────────────────────
clrt account create \
  --username alice \
  --entity "Acme Capital" \
  --email ops@acme.com \
  --intent liquidity \
  --json

clrt account status --json
clrt account login --device --json          # PKCE/device stub

# ── 2. Wallet (registry + MLX link) ──────────────────────────
clrt wallet status --json
clrt wallet registry --json
clrt wallet nodes --json
clrt wallet connect \
  --address 0x1234567890123456789012345678901234567890 \
  --json
clrt wallet balance --json
clrt wallet balance 0x1234567890123456789012345678901234567890 --json

# ── 3. Chain (clrty-1) ─────────────────────────────────────────
clrt chain status --json
clrt chain indexer --chain clrty-l1 --json
clrt chain sets local --json
clrt chain sets 0x1234567890123456789012345678901234567890 --json
clrt chain dx list --json
clrt chain dx parse --input '{"intent":"liquidity"}' --json
clrt chain dx execute --slug intent_execute --input '{}' --json
clrt chain transfer --wallet 0xabc... --amount 1000 --json
clrt chain simulate --events 10 --json
clrt chain devnet --json
clrt chain ready --wallet 0x1234567890123456789012345678901234567890 --json

# ── 4. P2P Commons (username send/receive) ───────────────────
clrt prism commons put ./README.md --json
clrt prism commons send --to bob --file ./README.md --json
clrt prism commons inbox --json
clrt prism commons receive <transfer-id> --json
clrt prism commons get <cid> --json
clrt prism commons discover arbitrage --json
clrt prism commons peers --json

# ── 5. PRISM intelligence ──────────────────────────────────────
clrt prism init --json
clrt prism sync --json
clrt prism identity --cage 123456789 --json
clrt prism query "arbitrage opportunities" --json
clrt prism queue status --json
clrt prism predict --capital 1000 --json
clrt prism cache status --json
clrt prism validate --intent arbitrage_scan --capital 1000 --json
clrt prism trace -n 20 --json
clrt prism stats --json
clrt prism estimate --capital 1000 --json
clrt prism execute --intent arbitrage_scan --json
clrt prism snapshot --json
clrt prism audit --json

# ── 6. HELIX execution ─────────────────────────────────────────
clrt helix status --json
clrt helix execute swap --from SOL --to USDC --amount 1000 --json
clrt helix simulate swap --amount 500 --json
clrt helix liquidity scan SOL/USDC --json

# ── 7. Skills ──────────────────────────────────────────────────
clrt skill install market-arbitrage
clrt skill run market-arbitrage --capital 1000 --max-exposure 0.2 --json
clrt skill status --json
clrt skill locks --json

# ── 8. Settlement + investor ───────────────────────────────────
clrt settlement instructions --json
clrt settlement register --wallet 0xabc... --json
clrt settlement preview --usd-cents 500000 --json
clrt settlement confirm-deposit --tx 0xdef... --wallet 0xabc... --json
clrt settlement status --wallet 0xabc... --json
clrt partner request-access --entity "Acme" --intent liquidity --json
clrt partner status --json

# ── 9. Exchange QA hub ─────────────────────────────────────────
clrt exchange list --json
clrt exchange status binance --json
clrt exchange test binance --json
clrt exchange qa --dry-run --json

# ── 10. Access packs ───────────────────────────────────────────
clrt pack list --json
clrt pack download mastermind --json
clrt pack download wallet-integration --json
clrt pack verify mastermind --json

# ── 11. Full pipeline ──────────────────────────────────────────
clrt run "optimize portfolio yield" --capital 5000 --json

# ── 12. Terminal UI (Wallet + Chain panels → :8545) ─────────────

### One-time setup

```bash
cp .env.example .env
# Set CLRTY_GATE_MASTER and CLRTY_PRISM_ADMIN_PASS
```

### Launch (gate env auto-synced)

```bash
make launch-prism              # sync gate + dev → http://localhost:5174
make launch-prism-live         # build + API + sync gate + dev
npm run launch:prism
npm run launch:prism:live
npm run dev:terminal
npm run build:terminal
clrt gate sync
clrt gate password             # personal access code for gate UI
```

Contact for access: **william@clarity-fintech.com**

### Terminal access gate

Until public launch, the PRISM terminal blocks the main funnel UI (SubMenu, OutputPanel, command execution) behind an **Account Gate**. Account creation is always available.

| Access state | UI |
|--------------|-----|
| `blocked` | Account create form only |
| `account_created` | Account profile + unlock path CTAs |
| `entitled` | Full terminal (investor / mastermind / partner) |
| `admin` | Full terminal (operator password) |
| `public_launch` | Full terminal (env bypass) |

**Unlock paths (any one):**

1. **Investor** — complete settlement walkthrough (`investor_class` via API)
2. **Mastermind pack** — `clrt pack download mastermind && clrt pack verify mastermind`
3. **Partner early access** — `clrt partner request-access` → API approval
4. **Personal access code** — `clrt gate password` (operator-issued)

**Env vars (terminal build):**

| Variable | Purpose |
|----------|---------|
| `CLRTY_GATE_MASTER` | Master secret for `clrt gate password` (auto-syncs digest) |
| `CLRTY_PRISM_ADMIN_PASS` | Operator admin password (auto-syncs to Vite) |
| `VITE_PRISM_TERMINAL_PUBLIC=1` | Disable gate (public launch) |
| `VITE_CLRTY_GATE_ACCESS_DIGEST` | Auto-set by `sync_gate_env` — do not set manually |
| `CLRTY_DEV_PARTNER_APPROVED=1` | Dev API: auto-approve partner status |

**API routes (entitlements):**

| Route | Method | Purpose |
|-------|--------|---------|
| `/v1/account/status?username=` | GET | Account + entitlements payload |
| `/v1/partner/request-access` | POST | Partner early access request |
| `/v1/partner/status?correlation_id=` | GET | Partner approval status |
```

Replace `clrt` with `npm run clrt --` when not globally installed.

---

## Command tree (v1.0.2)

```
clrt [--json] [--dry-run]
├── version
├── registry [--category System|Identity|Commons|Registry|Execution|Governance]
├── account
│   ├── create --username <name> [--entity] [--email] [--intent] [--cage] [--wallet] [--tier]
│   ├── login [--device-code]
│   └── status
├── wallet
│   ├── status
│   ├── balance [address]
│   ├── registry
│   ├── nodes
│   └── connect --address <addr>
├── partner
│   ├── request-access [--entity] [--intent]
│   └── status
├── settlement
│   ├── instructions
│   ├── register --wallet <addr>
│   ├── preview [--usd-cents <n>]
│   ├── confirm-deposit --tx <hash> [--wallet <addr>]
│   └── status [--wallet <addr>]
├── chain
│   ├── ready [--wallet <addr>]
│   ├── status
│   ├── sets [address]
│   ├── indexer [--chain clrty-l1]
│   ├── dx list|parse|execute
│   ├── transfer [--wallet] [--amount]
│   ├── simulate [--events <n>]
│   └── devnet
├── exchange
│   ├── list
│   ├── status [<slug>]
│   ├── test <slug>
│   └── qa [--dry-run]
├── pack
│   ├── list
│   ├── download mastermind|wallet-integration
│   └── verify mastermind|wallet-integration
├── prism
│   ├── init
│   ├── sync [--repos]
│   ├── identity --cage <ID>
│   ├── commons put|send|inbox|receive|get|discover|peers
│   ├── audit [--session <id>]
│   ├── query <text>
│   ├── queue status|submit
│   ├── predict [--capital <n>]
│   ├── cache status
│   ├── validate [--claim] [--intent] [--capital]
│   ├── trace [-n <num>]
│   ├── stats
│   ├── estimate [--capital <n>]
│   ├── execute [--intent]
│   └── snapshot
├── helix
│   ├── status
│   ├── execute swap --from --to --amount
│   ├── simulate swap
│   └── liquidity scan <pair>
├── skill install|run|status|locks
└── run <intent> [--capital <n>]
```

### Username + P2P + wallet (live)

```bash
# Requires clrty-api on :8545
clrt account create --username alice --entity "Acme" --email a@acme.com --intent liquidity
clrt wallet connect --address 0x1234567890123456789012345678901234567890
clrt wallet registry --json
clrt prism commons send --to bob --file ./README.md
clrt prism commons inbox
clrt prism commons receive <transfer-id>
```

Offline: account/wallet/commons queue locally to `~/.clrt/prism/` when API is down.

### Chain ready gate

```bash
clrt chain ready
clrt chain ready --wallet 0xabc... --json
```

Probes: `/v1/status`, `/v1/indexer/clrty-l1`, `/v1/sets/:wallet`, `/v1/dx/primitives`

### Wallet

```bash
clrt wallet status
clrt wallet registry
clrt wallet nodes
clrt wallet balance
clrt wallet connect --address 0x...
clrt pack download wallet-integration
```

Terminal UI WalletPanel auto-targets `http://127.0.0.1:8545` (override via settings).

---

## Color scheme

| State | Terminal color | Used for |
|-------|----------------|----------|
| PRISM intelligence | Purple (magenta) | Headers, PRISM steps, trace types |
| HELIX execution | Blue | HELIX headers, execution steps |
| Risk / guardrails | Red | Validation failure, errors, unknown skills |
| Success | Green | Completion messages, chain layer |
| Warning | Yellow | Skill lock conflicts |
| Dim | Gray | Progress arrows `→` |

---

## `clrt prism`

PRISM intelligence layer — intent, prediction, cache, adversarial validation, ledger.

### `clrt prism query <text>`

Intent-aware query with PoR scoring.

| Argument | Required | Description |
|----------|----------|-------------|
| `<text>` | Yes | Natural language query or intent string |

**Example:**

```bash
clrt prism query "arbitrage opportunities"
clrt prism query "liquidity_opportunities SOL pools"
```

**Sample output:**

```
PRISM ENGINE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━
→ Filtering market states...
→ Predicting liquidity gaps...
→ Optimizing query path...
Intent: arbitrage
Confidence: 72.5%

RESULT READY
{ ... JSON ... }
```

**Exit code:** `0` on success.

---

### `clrt prism predict`

Capital-context outcome forecast.

| Flag | Default | Description |
|------|---------|-------------|
| `--capital <n>` | `1000` | Capital amount in base units |

**Example:**

```bash
clrt prism predict --capital=1000
clrt prism predict --capital=50000
```

**Sample JSON output:**

```json
{
  "confidence": 85,
  "expected_yield_bps": 121,
  "risk_score": 0.49
}
```

---

### `clrt prism cache status`

Inspect AI cache layer state.

**Example:**

```bash
clrt prism cache status
```

**Sample JSON output:**

```json
{
  "mode": "adaptive",
  "entries": 0,
  "hit_rate": 0,
  "saved_queries": 0
}
```

---

### `clrt prism validate`

Adversarial QA gate — Trader vs Sentinel (MCA/TSR/AVR pattern). Writes ledger commit.

| Flag | Default | Description |
|------|---------|-------------|
| `--claim <text>` | `"Market opportunity within risk bounds"` | Trader claim to validate |
| `--intent <text>` | `arbitrage_scan` | Session intent for drift check |
| `--capital <n>` | `1000` | Capital context |

**Example:**

```bash
clrt prism validate
clrt prism validate --claim "SOL/USDC spread exceeds 40bps" --intent arbitrage_scan --capital 5000
```

**Sample output:**

```
→ [Trader] Claim: ...
→ [Sentinel] Intent drift check against: arbitrage_scan
→ [AVR] Adversarial validation PASSED — commit authorized
VALIDATION PASSED
{"passed": true, "hash": "b516ed06..."}
```

**Exit code:** `0` always (check `passed` in JSON for result).

---

### `clrt prism trace`

Mini-git reasoning log (newest first).

| Flag | Default | Description |
|------|---------|-------------|
| `-n <num>` | `20` | Maximum events to display |

**Example:**

```bash
clrt prism trace
clrt prism trace -n 50
```

**Sample line format:**

```
2026-06-27T21:27:39.245Z validate arbitrage_scan b516ed06
```

---

### `clrt prism stats`

Aggregate ledger and network metrics.

**Example:**

```bash
clrt prism stats
```

**Sample JSON output:**

```json
{
  "total_events": 12,
  "validations": 3,
  "validation_pass_rate": 100,
  "queries": 5,
  "executions": 2,
  "latency_saved_ms": 76,
  "prediction_accuracy": 92.4
}
```

---

## `clrt helix`

HELIX execution layer — routing, simulation, liquidity, MEV protection.

### `clrt helix status`

HELIX kernel and shadow state status.

**Example:**

```bash
clrt helix status
```

**Sample JSON output:**

```json
{
  "tick": 3,
  "kernel_running": true,
  "intents_resolved": 1,
  "net_flow_count": 2,
  "shadow_dir": "var/helix",
  "mode": "local"
}
```

---

### `clrt helix execute swap`

Execute optimized swap with MEV protection.

| Flag | Required | Description |
|------|----------|-------------|
| `--from <asset>` | Yes | Source asset symbol (e.g. `SOL`) |
| `--to <asset>` | Yes | Destination asset symbol (e.g. `USDC`) |
| `--amount <n>` | Yes | Swap amount |

**Example:**

```bash
clrt helix execute swap --from SOL --to USDC --amount 1000
```

**Sample output:**

```
HELIX EXECUTION ENGINE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━
→ Simulating routes...
→ Checking liquidity...
→ Applying MEV protection...

Best route selected:
→ Jupiter Pool A
→ Orca Route B

EXECUTION COMPLETE
Slippage: 0.12%
Savings: 18.4%
```

---

### `clrt helix simulate swap`

Dry-run swap simulation (no transaction reference).

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--amount <n>` | Yes | — | Swap amount |
| `--from <asset>` | No | `SOL` | Source asset |
| `--to <asset>` | No | `USDC` | Destination asset |

**Example:**

```bash
clrt helix simulate swap --amount 500
clrt helix simulate swap --from SOL --to USDC --amount 500
```

**Sample JSON output:**

```json
{
  "routes": ["Jupiter Pool A", "Orca Route B"],
  "slippage_pct": 0.12,
  "savings_pct": 18.4,
  "status": "simulated"
}
```

---

### `clrt helix liquidity scan <pair>`

Multi-venue liquidity depth scan.

| Argument | Required | Description |
|----------|----------|-------------|
| `<pair>` | Yes | Pair format `SOL/USDC` or `SOL-USDC` |

**Example:**

```bash
clrt helix liquidity scan SOL/USDC
```

**Sample output:**

```
→ Depth: $2,700,000
→ Jupiter: $1,215,000 (8 bps)
→ Orca: $945,000 (12 bps)
→ Raydium: $540,000 (15 bps)
Best route: Jupiter → Orca split
```

---

## `clrt skill`

Skills action layer — install, run, lock monitor.

### `clrt skill install <name>`

Register a built-in skill for execution.

| Argument | Description |
|----------|-------------|
| `<name>` | Short or full skill name |

**Valid names:**

- `market-arbitrage` → `market-arbitrage-skill`
- `trend-momentum` → `trend-momentum-skill`
- `payment-executor` → `payment-executor-skill`
- `risk-manager` → `risk-manager-skill`

**Example:**

```bash
clrt skill install market-arbitrage
```

**Exit code:** `1` if skill name unknown.

---

### `clrt skill run <name>`

Execute skill with capital-aware constraints. One skill lock at a time.

| Argument / Flag | Default | Description |
|-----------------|---------|-------------|
| `<name>` | — | Skill short or full name |
| `--capital <n>` | `1000` | Capital allocation |
| `--max-exposure <n>` | `0.2` | Max exposure fraction (0–1) |

**Example:**

```bash
clrt skill run market-arbitrage --capital 1000
clrt skill run risk-manager --capital 5000 --max-exposure 0.15
```

**Exit code:** `1` if blocked by active lock.

---

### `clrt skill status`

List installed skills and full marketplace manifest.

```bash
clrt skill status
```

---

### `clrt skill locks`

Show active skill lock (if any).

```bash
clrt skill locks
```

---

## `clrt run <intent>`

Full PRISM → HELIX → chain pipeline in one command.

| Argument / Flag | Default | Description |
|-----------------|---------|-------------|
| `<intent>` | — | Natural language intent string |
| `--capital <n>` | `5000` | Capital for context and execution |

**Example:**

```bash
clrt run "optimize portfolio yield"
clrt run "optimize portfolio yield" --capital 5000
```

**Sample output:**

```
PRISM: interpreting intent
PRISM: forecasting outcomes
HELIX: simulating execution paths
HELIX: selecting optimal route
CHAIN: executing transaction

CLRTY PIPELINE ACTIVE
━━━━━━━━━━━━━━━━━━━━━━
→ [PRISM] interpreting intent: optimize portfolio yield
→ [PRISM] forecasting outcomes
→ [HELIX] simulating execution paths
→ [HELIX] selecting optimal route: ...
→ [CHAIN] executing transaction: helix-...
PIPELINE COMPLETE
{"chain_commit": "commit-...", "execution": { ... }}
```

---

## Environment variables

See [ENVIRONMENT.md](./ENVIRONMENT.md) for full reference.

| Variable | Effect on CLI |
|----------|---------------|
| `CLRTY_API_URL` | Enables live API mode for PRISM/HELIX |
| `CLRTY_API_KEY` | Bearer token for API requests |
| `PRISM_REPO_DIR` | Custom mini-git ledger directory |

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Validation error, unknown skill, skill lock blocked, or unhandled exception |

---

## Related

- [FULL_USAGE.md](./FULL_USAGE.md) — operational guide with troubleshooting
- [EXAMPLES.md](./EXAMPLES.md) — multi-step workflow scripts
- [PRIMITIVE_REGISTRY.md](./PRIMITIVE_REGISTRY.md) — Tier 5 command taxonomy
- [PROJECT_DATA_INVENTORY.md](./PROJECT_DATA_INVENTORY.md) — repo + manifest sync

---

## Verify & Makefile

```bash
make verify        # packages + inventory + cross-repo + CLI smoke
make live          # npm run build + ensure API + strict verify + smoke
make live-verify   # ensure clrty-api + CLRTY_VERIFY_STRICT=1 verify + smoke
make cli-smoke     # run scripts/cli_smoke.sh
make build-kit     # dist/clarity-prism-full.zip
bash scripts/ensure_api_running.sh
```

---

## v1.0.2 command groups (summary)

| Group | Purpose |
|-------|---------|
| `clrt account` | Passwordless profile (no password stored) |
| `clrt partner` | Early Access / Mastermind request |
| `clrt settlement` | Genesis deposit on clrty-1 (`/v1/compliance/*`) |
| `clrt wallet` | Registry, nodes, balance, MLX connect (`/v1/wallet/*`) |
| `clrt chain` | clrty-1 status, sets, indexer, DX, transfer, ready gate |
| `clrt exchange` | QA hub — Binance, Coinbase, Kraken + antiban rate limits |
| `clrt pack` | Mastermind + wallet-integration ZIPs |
| `clrt prism init\|sync\|commons\|audit` | Registry, P2P commons, compliance export |
| `clrt registry` | List all registered primitives |
| `clrt version` | Release info + **μ micro counter** |
