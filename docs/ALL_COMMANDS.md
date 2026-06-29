# CLRTY CLI — All Commands (v1.0.2.μ1)

**Binary:** `clrt` · **Version:** `1.0.2.μ1`  
**Global flags:** `--json` · `--dry-run` · `-h, --help` · `-V, --version`

Run without global install:

```bash
cd clarity-prism-cli
npm run build
npm run clrt -- <command>
./bin/clrt <command>
```

Start blockchain (live mode):

```bash
cd $CLRTY_PROJECT && cargo run -p clrty-api   # :8545
export CLRTY_API_URL=http://127.0.0.1:8545
make live-verify                              # from clarity-prism-cli/
```

---

## Top-level commands

| Command | Description |
|---------|-------------|
| `clrt version` | Release info + micro counter (μ) |
| `clrt registry` | List registered CLI primitives |
| `clrt run <intent>` | Full PRISM → HELIX → chain pipeline |
| `clrt prism …` | PRISM intelligence layer |
| `clrt helix …` | HELIX execution layer |
| `clrt skill …` | Skills action layer |
| `clrt account …` | Passwordless account profile |
| `clrt wallet …` | CLRTY Wallet — registry, balance, nodes |
| `clrt chain …` | clrty-l1 chain tools |
| `clrt settlement …` | Genesis settlement & compliance |
| `clrt partner …` | Partner early access |
| `clrt exchange …` | Exchange integration QA hub |
| `clrt pack …` | Access pack download & verify |

---

## `clrt version`

```bash
clrt version
clrt version --json
clrt --version
```

---

## `clrt registry`

```bash
clrt registry
clrt registry --category System
clrt registry --category Identity
clrt registry --category Commons
clrt registry --category Registry
clrt registry --category Execution
clrt registry --category Governance
clrt registry --json
```

| Flag | Description |
|------|-------------|
| `--category <cat>` | Filter by category |

---

## `clrt run`

```bash
clrt run "optimize portfolio yield"
clrt run "optimize portfolio yield" --capital 5000
clrt run "arbitrage scan SOL pools" --capital 10000 --json
```

| Argument / Flag | Default | Description |
|-----------------|---------|-------------|
| `<intent>` | — | Natural language intent |
| `--capital <n>` | `5000` | Capital context |

---

## `clrt account`

### `clrt account create`

```bash
clrt account create \
  --username alice \
  --entity "Acme Capital" \
  --email ops@acme.com \
  --intent liquidity \
  --json

clrt account create \
  --username alice \
  --entity "Acme" \
  --email a@acme.com \
  --intent liquidity \
  --cage 123456789 \
  --wallet 0x1234567890123456789012345678901234567890 \
  --tier seed \
  --dry-run
```

| Flag | Required | Description |
|------|----------|-------------|
| `--username <name>` | Yes | Unique P2P username |
| `--entity <name>` | Yes | Entity name |
| `--email <email>` | Yes | Contact email |
| `--intent <intent>` | Yes | Session intent |
| `--cage <cage>` | No | CAGE/DUNS code |
| `--wallet <wallet>` | No | Pre-link wallet address |
| `--tier <tier>` | No | `seed` \| `strategic` \| `hardware-node` |

**API:** `POST /v1/prism/account/register`

### `clrt account login`

```bash
clrt account login
clrt account login --device
clrt account login --device --json
```

| Flag | Description |
|------|-------------|
| `--device` | Use device code flow (stub) |

### `clrt account status`

```bash
clrt account status
clrt account status --json
```

---

## `clrt wallet`

### `clrt wallet status`

```bash
clrt wallet status --json
```

Returns username, namespace, linked address, registry snapshot.

### `clrt wallet balance`

```bash
clrt wallet balance
clrt wallet balance 0x1234567890123456789012345678901234567890 --json
```

| Argument | Description |
|----------|-------------|
| `[address]` | Defaults to profile-linked wallet |

**API:** `GET /v1/wallet/balance/:wallet`

### `clrt wallet registry`

```bash
clrt wallet registry --json
```

**API:** `GET /v1/wallet/registry`

### `clrt wallet nodes`

```bash
clrt wallet nodes --json
```

**API:** `GET /v1/wallet/nodes` (25-node manifest)

### `clrt wallet connect`

```bash
clrt wallet connect --address 0x1234567890123456789012345678901234567890 --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--address <addr>` | Yes | Wallet to link to username |

**API:** `POST /v1/wallet/register` with `{ wallet, environment: "core" }`

---

## `clrt chain`

### `clrt chain status`

```bash
clrt chain status --json
```

**API:** `GET /v1/status`

### `clrt chain sets`

```bash
clrt chain sets
clrt chain sets local --json
clrt chain sets 0x1234567890123456789012345678901234567890 --json
```

**API:** `GET /v1/sets/:address`

### `clrt chain indexer`

```bash
clrt chain indexer --json
clrt chain indexer --chain clrty-l1 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--chain <name>` | `clrty-l1` | Chain name |

**API:** `GET /v1/indexer/:chain`

### `clrt chain dx list`

```bash
clrt chain dx list --json
```

**API:** `GET /v1/dx/primitives`

### `clrt chain dx parse`

```bash
clrt chain dx parse --input '{"intent":"liquidity"}' --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--input <json>` | Yes | DX payload JSON |

**API:** `POST /v1/dx/parse`

### `clrt chain dx execute`

```bash
clrt chain dx execute --slug intent_execute --input '{}' --json
clrt chain dx execute --slug intelligent_transfer --input '{"wallet":"0x...","amount":"1000"}' --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--slug <slug>` | `intent_execute` | DX primitive slug |
| `--input <json>` | `{}` | Execution payload |

**API:** `POST /v1/dx/execute`

### `clrt chain transfer`

```bash
clrt chain transfer --wallet 0xabc... --amount 1000000000 --json
```

| Flag | Description |
|------|-------------|
| `--wallet <addr>` | Source wallet |
| `--amount <n>` | Amount in base units |

Uses DX slug `intelligent_transfer`.

### `clrt chain simulate`

```bash
clrt chain simulate --events 10 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--events <n>` | `10` | Event count |

**API:** `GET /v1/sim/events?limit=n`

### `clrt chain ready`

```bash
clrt chain ready
clrt chain ready --wallet 0x1234567890123456789012345678901234567890 --json
export CLRTY_API_STRICT=1 && clrt chain ready --json
```

| Flag | Description |
|------|-------------|
| `--wallet <addr>` | Wallet for sets probe (default: `local`) |

Probes: `/v1/status`, `/v1/indexer/clrty-l1`, `/v1/sets/:wallet`, `/v1/dx/primitives`

### `clrt chain devnet`

```bash
clrt chain devnet --json
```

Local devnet / l-dnet status.

---

## `clrt prism`

### `clrt prism query`

```bash
clrt prism query "arbitrage opportunities"
clrt prism query "liquidity_opportunities SOL pools" --json
```

| Argument | Description |
|----------|-------------|
| `<text>` | Natural language query |

### `clrt prism queue status`

```bash
clrt prism queue status --json
```

### `clrt prism queue submit`

```bash
clrt prism queue submit "scan SOL/USDC spread"
clrt prism queue submit "portfolio rebalance" "risk check" --json
```

### `clrt prism predict`

```bash
clrt prism predict --capital 1000 --json
clrt prism predict --capital 50000 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--capital <n>` | `1000` | Capital amount |

### `clrt prism cache status`

```bash
clrt prism cache status --json
```

### `clrt prism validate`

```bash
clrt prism validate --json
clrt prism validate \
  --claim "SOL/USDC spread exceeds 40bps" \
  --intent arbitrage_scan \
  --capital 5000 \
  --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--claim <text>` | trader default | Trader claim |
| `--intent <text>` | `arbitrage_scan` | Session intent |
| `--capital <n>` | `1000` | Capital context |

### `clrt prism trace`

```bash
clrt prism trace
clrt prism trace -n 50 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `-n <num>` | `20` | Max events |

### `clrt prism stats`

```bash
clrt prism stats --json
```

### `clrt prism estimate`

```bash
clrt prism estimate --capital 1000 --json
clrt prism estimate --capital 5000 --intent arbitrage_scan --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--capital <n>` | `1000` | Capital amount |
| `--intent <text>` | `arbitrage_scan` | Execution intent |

### `clrt prism execute`

```bash
clrt prism execute --json
clrt prism execute --algo intent_execute --input '{"capital":1000}' --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--algo <hash>` | `intent_execute` | Algorithm hash or DX slug |
| `--input <json>` | `{}` | Input payload |

### `clrt prism snapshot`

```bash
clrt prism snapshot --json
clrt prism snapshot --out ~/.clrt/prism/backup.json --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--out <path>` | `~/.clrt/prism/ledger-snapshot.json` | Output path |

### `clrt prism init`

```bash
clrt prism init --json
```

Seeds `~/.clrt/prism/` local node config.

### `clrt prism sync`

```bash
clrt prism sync --json
clrt prism sync --repos --json
clrt prism sync --drift --json
```

| Flag | Description |
|------|-------------|
| `--repos` | List pinned repos |
| `--drift` | Show drift report |

### `clrt prism identity`

```bash
clrt prism identity --cage --json
```

| Flag | Description |
|------|-------------|
| `--cage` | Show CAGE/DUNS identifier |

### `clrt prism audit`

```bash
clrt prism audit --json
clrt prism audit --session --json
```

| Flag | Description |
|------|-------------|
| `--session` | Include session token metadata |

---

## `clrt prism commons`

### `clrt prism commons put`

```bash
clrt prism commons put ./README.md --json
clrt prism commons put ./asset.bin --topic arbitrage --json
```

| Argument / Flag | Description |
|-----------------|-------------|
| `<file>` | File to upload to local CAS |
| `--topic <topic>` | Discovery topic |

### `clrt prism commons send`

```bash
clrt prism commons send --to bob --file ./README.md --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--to <username>` | Yes | Recipient username |
| `--file <path>` | Yes | File to send |

**API:** `POST /v1/commons/send` (queues locally if offline)

### `clrt prism commons inbox`

```bash
clrt prism commons inbox --json
```

**API:** `GET /v1/commons/inbox/:username`

### `clrt prism commons receive`

```bash
clrt prism commons receive <transfer-id> --json
```

### `clrt prism commons get`

```bash
clrt prism commons get <cid> --json
```

### `clrt prism commons discover`

```bash
clrt prism commons discover arbitrage --json
```

### `clrt prism commons peers`

```bash
clrt prism commons peers --json
```

---

## `clrt helix`

### `clrt helix status`

```bash
clrt helix status --json
```

### `clrt helix execute swap`

```bash
clrt helix execute swap --from SOL --to USDC --amount 1000 --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--from <asset>` | Yes | Source asset |
| `--to <asset>` | Yes | Destination asset |
| `--amount <n>` | Yes | Swap amount |

### `clrt helix simulate swap`

```bash
clrt helix simulate swap --amount 500 --json
clrt helix simulate swap --from SOL --to USDC --amount 500 --json
```

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--amount <n>` | Yes | — | Swap amount |
| `--from <asset>` | No | `SOL` | Source asset |
| `--to <asset>` | No | `USDC` | Destination asset |

### `clrt helix liquidity scan`

```bash
clrt helix liquidity scan SOL/USDC --json
clrt helix liquidity scan SOL-USDC --json
```

| Argument | Description |
|----------|-------------|
| `<pair>` | Pair as `SOL/USDC` or `SOL-USDC` |

---

## `clrt skill`

### `clrt skill install`

```bash
clrt skill install market-arbitrage
clrt skill install trend-momentum
clrt skill install payment-executor
clrt skill install risk-manager
```

Valid short names: `market-arbitrage`, `trend-momentum`, `payment-executor`, `risk-manager`

### `clrt skill run`

```bash
clrt skill run market-arbitrage --capital 1000 --json
clrt skill run risk-manager --capital 5000 --max-exposure 0.15 --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--capital <n>` | `1000` | Capital allocation |
| `--max-exposure <n>` | `0.2` | Max exposure (0–1) |

### `clrt skill status`

```bash
clrt skill status --json
```

### `clrt skill locks`

```bash
clrt skill locks --json
```

---

## `clrt settlement`

### `clrt settlement instructions`

```bash
clrt settlement instructions --json
```

**API:** `GET /v1/compliance/genesis-instructions`

### `clrt settlement register`

```bash
clrt settlement register --wallet 0xabc... --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--wallet <address>` | Yes | Wallet address |

### `clrt settlement preview`

```bash
clrt settlement preview --json
clrt settlement preview --wallet 0xabc... --json
```

| Flag | Description |
|------|-------------|
| `--wallet <address>` | Wallet (defaults to profile) |

### `clrt settlement confirm-deposit`

```bash
clrt settlement confirm-deposit --tx 0xdef... --json
clrt settlement confirm-deposit --tx 0xdef... --wallet 0xabc... --json
```

| Flag | Required | Description |
|------|----------|-------------|
| `--tx <hash>` | Yes | Deposit transaction hash |
| `--wallet <address>` | No | Wallet address |

### `clrt settlement status`

```bash
clrt settlement status --json
clrt settlement status 0xabc... --json
```

| Argument | Description |
|----------|-------------|
| `[wallet]` | Wallet address (optional) |

---

## `clrt partner`

### `clrt partner request-access`

```bash
clrt partner request-access --json
clrt partner request-access --tier strategic --json
```

| Flag | Default | Description |
|------|---------|-------------|
| `--tier <tier>` | `seed` | Requested tier |

### `clrt partner status`

```bash
clrt partner status --json
```

---

## `clrt exchange`

### `clrt exchange list`

```bash
clrt exchange list --json
```

### `clrt exchange status`

```bash
clrt exchange status --json
clrt exchange status binance --json
```

| Argument | Description |
|----------|-------------|
| `[slug]` | Exchange slug (binance, coinbase, kraken, …) |

### `clrt exchange test`

```bash
clrt exchange test binance --json
clrt exchange test coinbase --dry-run --json
```

| Argument | Description |
|----------|-------------|
| `<slug>` | Exchange slug |

### `clrt exchange qa`

```bash
clrt exchange qa --json
```

Runs probe suite across all configured exchanges.

---

## `clrt pack`

### `clrt pack list`

```bash
clrt pack list --json
```

Packs: `mastermind`, `wallet-integration`

### `clrt pack download`

```bash
clrt pack download mastermind --json
clrt pack download wallet-integration --json
clrt pack download mastermind --dry-run --json
```

| Argument | Description |
|----------|-------------|
| `<id>` | `mastermind` \| `wallet-integration` |

### `clrt pack verify`

```bash
clrt pack verify mastermind --json
clrt pack verify wallet-integration --json
```

---

## Makefile & verify

```bash
make verify        # packages + inventory + cross-repo + smoke
make live          # build + ensure API + strict verify + smoke
make live-verify   # ensure clrty-api + strict verify + smoke
make cli-smoke     # scripts/cli_smoke.sh
make build-kit     # dist/clarity-prism-full.zip
bash scripts/ensure_api_running.sh
bash npm-install-local.sh
```

---

## Environment variables

| Variable | Effect |
|----------|--------|
| `CLRTY_API_URL` | API base (default `http://127.0.0.1:8545`) |
| `CLRTY_API_KEY` | Bearer token for API |
| `CLRTY_VERIFY_STRICT=1` | Fail verify if API unreachable |
| `CLRTY_API_STRICT=1` | Exit 1 on `chain ready` failure |
| `PRISM_REPO_DIR` | Custom mini-git ledger path |
| `EXCHANGE_RATE_LIMIT_RPS` | Exchange rate limit (default 10) |
| `EXCHANGE_RATE_LIMIT_BURST` | Exchange burst (default 20) |

---

## One-shot copy-paste (full workflow)

```bash
# Stack
cargo run -p clrty-api &
cd clarity-prism-cli && npm run build

# Identity + wallet + chain
clrt chain ready --json
clrt account create --username alice --entity "Acme" --email a@acme.com --intent liquidity --json
clrt wallet connect --address 0x1234567890123456789012345678901234567890 --json
clrt wallet registry --json
clrt chain status --json

# P2P + intelligence + execution
clrt prism commons send --to bob --file ./README.md --json
clrt prism query "arbitrage opportunities" --json
clrt helix execute swap --from SOL --to USDC --amount 1000 --json
clrt skill run market-arbitrage --capital 1000 --json
clrt run "optimize portfolio yield" --capital 5000 --json

# Investor + packs
clrt settlement instructions --json
clrt partner request-access --tier seed --json
clrt pack list --json
clrt pack download mastermind --json
```

---

## Related

- [CLI_REFERENCE.md](./CLI_REFERENCE.md) — detailed output samples and color scheme
- [FULL_USAGE.md](./FULL_USAGE.md) — operational guide
- [EXAMPLES.md](./EXAMPLES.md) — multi-step workflows
- [ENVIRONMENT.md](./ENVIRONMENT.md) — full config reference
