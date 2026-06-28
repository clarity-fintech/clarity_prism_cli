# CLI Reference — Complete Command Guide

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
│   ├── confirm-deposit --wallet <addr> --tx-hash <hash>
│   └── status [--wallet <addr>]
├── chain
│   ├── ready [--wallet <addr>]
│   ├── status
│   ├── sets <address>
│   ├── indexer
│   ├── dx
│   ├── simulate
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
│   ├── commons get|put|send|inbox|receive|discover|peers
│   ├── audit [--session <id>]
│   ├── query <text>
│   ├── queue status|submit
│   ├── predict [--capital <n>]
│   ├── cache status
│   ├── validate [--claim] [--intent] [--capital]
│   ├── trace [-n <num>]
│   └── stats
├── helix
│   ├── status
│   ├── execute swap --from --to --amount
│   ├── simulate swap
│   └── liquidity scan <pair>
├── skill install|run|status|locks
└── run <intent> [--capital <n>]
```

### Username + P2P

```bash
clrt account create --username alice --entity "Acme" --email a@acme.com --intent liquidity
clrt prism commons send --to bob --file ./README.md
clrt prism commons inbox
clrt prism commons receive <transfer-id>
```

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
clrt wallet balance
clrt wallet connect --address 0x...
clrt pack download wallet-integration
```

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

## v1.0.1 commands (summary)

| Group | Purpose |
|-------|---------|
| `clrt account` | Passwordless profile (no password stored) |
| `clrt partner` | Early Access / Mastermind request |
| `clrt settlement` | Genesis deposit on clrty-1 (`/v1/compliance/*`) |
| `clrt chain` | clrty-1 status, sets, indexer, DX primitives |
| `clrt exchange` | QA hub — Binance, Coinbase, Kraken + antiban rate limits |
| `clrt pack` | Mastermind + wallet-integration ZIPs |
| `clrt prism init\|sync\|commons\|audit` | Registry, P2P commons, compliance export |
| `clrt registry` | List all registered primitives |
| `clrt version` | Release info + **μ micro counter** |
