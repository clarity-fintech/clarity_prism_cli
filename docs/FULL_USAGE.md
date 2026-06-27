# Full Usage Guide

Complete operational reference for the CLRTY PRISM + HELIX download ecosystem.

---

## 1. System overview

CLRTY OS is three coordinated layers:

| Layer | Role | CLI namespace | npm packages |
|-------|------|---------------|--------------|
| **PRISM** | Intelligence — intent, prediction, cache, audit ledger | `clrt prism` | `@clrt/prism-*` |
| **HELIX** | Execution — routing, simulation, MEV protection | `clrt helix` | `@clrt/helix-*` |
| **SKILLS** | Action — modular capital-aware execution units | `clrt skill` | `@clrt/skills-sdk` |

The **`clrt run`** command orchestrates all three: PRISM interprets → HELIX simulates and routes → chain commit is logged.

---

## 2. Installation paths

### A. Git clone (recommended — full developer access)

```bash
git clone https://github.com/williamsnameiswill/clarity-prism-cli.git
cd clarity-prism-cli
npm install
npm run build
bash npm-install-local.sh
```

### B. ZIP bundle (offline / customer delivery)

1. Download or build `dist/clarity-prism-full.zip`
2. Extract anywhere
3. Run:

```bash
npm install
npm run build
bash npm-install-local.sh
```

### C. Workspace-only (no global CLI)

```bash
npm install
npm run build
node apps/cli/dist/index.js --help
```

Alias (optional):

```bash
alias clrt='node /path/to/clarity-prism-cli/apps/cli/dist/index.js'
```

### D. Programmatic SDK (Node.js / TypeScript)

```bash
npm install ./packages/prism-sdk
npm install ./packages/prism-helix
npm install ./packages/skills-sdk
```

See [PACKAGES.md](./PACKAGES.md) for import examples.

---

## 3. Operating modes

### Local mode (default)

- No `CLRTY_API_URL` set
- Deterministic responses from in-repo engines
- Mini-git ledger writes to `~/.clrt/prism/repo/events.log`
- HELIX status returns `mode: "local"`

Use for: development, demos, offline verification, CI smoke tests.

### Live API mode

Set environment (see [ENVIRONMENT.md](./ENVIRONMENT.md)):

```bash
export CLRTY_API_URL=http://127.0.0.1:8787
export CLRTY_API_KEY=your_token   # if required
```

| Endpoint | Method | Used by |
|----------|--------|---------|
| `/v1/prism/status` | GET | SDK health |
| `/v1/prism/intent-aware` | POST | `clrt prism query`, `PrismClient.query()` |
| `/v1/helix/status` | GET | `clrt helix status` |
| `/v1/helix/intents` | POST | HELIX intent submit |
| `/v1/helix/net/preview` | GET | Net settlement preview |

If the API is unreachable, SDK and CLI **automatically fall back to local mode**.

---

## 4. CLI color system

Terminal output is color-coded for layer identification:

| Color | Meaning | Example output |
|-------|---------|----------------|
| **Purple** | PRISM intelligence | `PRISM ENGINE ACTIVE`, query steps |
| **Blue** | HELIX execution | `HELIX EXECUTION ENGINE`, route simulation |
| **Red** | Risk / guardrails / errors | Validation failure, unknown skill |
| **Green** | Success / chain commit | `RESULT READY`, `EXECUTION COMPLETE` |
| **Yellow** | Warnings | Skill lock held by another skill |
| **Dim** | Progress steps | `→ Filtering market states...` |

Section headers use a 22-character rule line: `━━━━━━━━━━━━━━━━━━━━━━`

---

## 5. PRISM layer — full usage

### 5.1 Intent query

```bash
clrt prism query "arbitrage opportunities"
clrt prism query "portfolio_state wallet analysis"
```

**Behavior:**
1. Parses first token as intent when text contains spaces
2. Runs query minimization and PoR scoring
3. Logs event to mini-git ledger
4. Prints confidence and full JSON result

**Key JSON fields:**

| Field | Type | Description |
|-------|------|-------------|
| `intent` | string | Resolved intent label |
| `confidence` | number | 0–100 relevance confidence |
| `relevance_score` | number | 0–1 raw PoR score |
| `proof_of_relevance` | boolean | Passes 0.55 threshold |
| `suggested_routes` | string[] | HELIX node paths or compliance gate |
| `capital_context.lane` | string | `helix_internal` or `queue_slippage_gate` |
| `mode` | string | `local` or `api` |

### 5.2 Capital prediction

```bash
clrt prism predict --capital=1000
clrt prism predict --capital=50000
```

**Output fields:**

| Field | Description |
|-------|-------------|
| `confidence` | Forecast confidence (scales with capital) |
| `expected_yield_bps` | Basis points yield estimate |
| `risk_score` | 0–1 portfolio risk estimate |

### 5.3 Cache inspection

```bash
clrt prism cache status
```

**Output fields:**

| Field | Description |
|-------|-------------|
| `mode` | `adaptive` \| `aggressive` \| `minimal` |
| `entries` | In-memory cache entry count |
| `hit_rate` | Percentage of cache hits |
| `saved_queries` | Queries avoided via cache |

Configure programmatically:

```javascript
await prism.cache.configure({ mode: "adaptive" });
```

### 5.4 Adversarial validation (mini-git commit)

```bash
clrt prism validate
clrt prism validate --claim "SOL/USDC spread exceeds 40bps" --intent arbitrage_scan --capital 1000
```

**Flow:**
1. **Trader** submits claim
2. **Sentinel** checks intent drift
3. **AVR** gate passes or blocks
4. Writes immutable event with `content_hash` to ledger

**Output:** `passed` boolean + commit `hash` (full SHA-256 in ledger).

### 5.5 Trace log (git-log style)

```bash
clrt prism trace
clrt prism trace -n 50
```

Shows newest-first: timestamp, event type, intent, hash prefix.

### 5.6 Network stats

```bash
clrt prism stats
```

**Output fields:**

| Field | Description |
|-------|-------------|
| `total_events` | All ledger events |
| `validations` | Validate event count |
| `validation_pass_rate` | Percent passed |
| `queries` | Query event count |
| `executions` | Execute event count |
| `latency_saved_ms` | Estimated ms saved |
| `prediction_accuracy` | Model accuracy when queries > 0 |

---

## 6. HELIX layer — full usage

### 6.1 Kernel status

```bash
clrt helix status
```

**Output fields:**

| Field | Description |
|-------|-------------|
| `tick` | Kernel tick counter |
| `kernel_running` | Boolean running state |
| `intents_resolved` | Resolved intent count |
| `net_flow_count` | Active net flow records |
| `shadow_dir` | Shadow state directory |
| `mode` | `local` or `api` |

### 6.2 Execute swap (live path)

```bash
clrt helix execute swap --from SOL --to USDC --amount 1000
```

**Steps shown:**
1. Simulating routes
2. Checking liquidity
3. Applying MEV protection (private lane + shield)

**Output:**
- Best route list (e.g. Jupiter Pool A, Orca Route B)
- `Slippage: 0.12%`
- `Savings: 18.4%`

### 6.3 Simulate swap (dry run)

```bash
clrt helix simulate swap --amount 500
clrt helix simulate swap --from SOL --to USDC --amount 500
```

Returns JSON with `status: "simulated"` (no `tx_ref`).

### 6.4 Liquidity scan

```bash
clrt helix liquidity scan SOL/USDC
clrt helix liquidity scan SOL-USDC
```

**Output per venue:** name, depth USD, slippage bps. Final line: recommended split route.

---

## 7. Skills layer — full usage

### 7.1 Install skill

```bash
clrt skill install market-arbitrage
clrt skill install trend-momentum
clrt skill install payment-executor
clrt skill install risk-manager
```

Short names map to `*-skill` IDs automatically.

### 7.2 Run skill

```bash
clrt skill run market-arbitrage --capital 1000
clrt skill run market-arbitrage --capital 1000 --max-exposure 0.2
```

**Lock rule:** Only one skill runs at a time. A second concurrent run returns `status: "blocked"`.

### 7.3 Status and locks

```bash
clrt skill status    # installed skills + marketplace manifest
clrt skill locks     # active lock monitor
```

### Built-in skills reference

| Short name | Skill ID | Output highlights |
|------------|----------|-------------------|
| `market-arbitrage` | `market-arbitrage-skill` | `opportunities`, `best_spread_bps` |
| `trend-momentum` | `trend-momentum-skill` | `signal`, `strength` |
| `payment-executor` | `payment-executor-skill` | `queued`, `rail` |
| `risk-manager` | `risk-manager-skill` | `risk_score`, `within_limits` |

---

## 8. Full pipeline — `clrt run`

```bash
clrt run "optimize portfolio yield"
clrt run "optimize portfolio yield" --capital 5000
```

**Internal chain:**

```
PRISM: interpret intent
PRISM: forecast outcomes (PoR model)
HELIX: simulate execution paths
HELIX: select optimal route + MEV protection
CHAIN: commit transaction reference
```

**Output:** `chain_commit` string + full execution JSON.

---

## 9. Mini-git ledger

**Default location:** `~/.clrt/prism/repo/events.log`

**Override:**

```bash
export PRISM_REPO_DIR=/custom/path/to/repo
```

**Event structure (JSONL, one event per line):**

```json
{
  "id": "evt-...",
  "timestamp": "2026-06-27T...",
  "type": "query|validate|execute|skill|trace",
  "intent": "...",
  "parent_hash": "...",
  "content_hash": "...",
  "evidence": {}
}
```

Each event links to the previous via `parent_hash` (Merkle-style chain).

---

## 10. Verification and CI

```bash
make verify          # packages + CLI smoke + ZIP
make packages-verify # build all @clrt/* packages
make cli-smoke       # run every CLI command
make build-kit       # produce dist/clarity-prism-full.zip
```

---

## 11. Troubleshooting

| Issue | Fix |
|-------|-----|
| `clrt: command not found` | Run `bash npm-install-local.sh` or use `node apps/cli/dist/index.js` |
| Build fails on package order | Run `npm run build` (uses ordered `scripts/build_all.mjs`) |
| API mode not activating | Confirm `CLRTY_API_URL` is exported; test with `curl $CLRTY_API_URL/v1/prism/status` |
| Skill blocked | Wait for active skill to finish; check `clrt skill locks` |
| Empty trace log | Run any `prism query` or `validate` first to populate ledger |
| Permission errors on ledger | Ensure write access to `~/.clrt/prism/repo` or set `PRISM_REPO_DIR` |

---

## 12. Related documents

- [CLI_REFERENCE.md](./CLI_REFERENCE.md) — command syntax cheat sheet
- [PACKAGES.md](./PACKAGES.md) — programmatic SDK APIs
- [EXAMPLES.md](./EXAMPLES.md) — end-to-end workflow scripts
- [ENVIRONMENT.md](./ENVIRONMENT.md) — all configuration variables
