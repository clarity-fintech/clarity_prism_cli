# PRISM Terminal — Full Usage (Native Shell)

**Primary interface:** your terminal shell (`make launch-prism`)  
**Backend:** clrty-api on http://127.0.0.1:8545  
**Optional browser UI:** `make launch-prism-web` → http://localhost:5174

---

## Quick start

```bash
cd clarity-prism-cli
make launch-prism
```

You get `prism>` prompt — full `clrt` commands run in this shell. No browser.

Optional rich UI (account gate, Commons panel):

```bash
make launch-prism-web
```

---

## Architecture

| Layer | Where | Port |
|-------|--------|------|
| PRISM Terminal UI | Browser / Vite | `:5174` |
| clrty-api | Rust backend | `:8545` |
| `clrt` CLI | Shell scripting | N/A (Commons send blocked) |

The terminal **never** shells out to `node apps/cli`. Funnel commands execute in-browser via `apiFetch` to `:8545`.

---

## Account gate

Unlock with **any one**:

1. Operator password (`CLRTY_PRISM_ADMIN_PASS`)
2. Personal access code (`clrt gate password` from `CLRTY_GATE_MASTER`)
3. Investor walkthrough (terminal UI)
4. Mastermind pack verify
5. Partner approval

Contact: **william@clarity-fintech.com**

---

## Navigation

| Key | Action |
|-----|--------|
| ↑ / ↓ | Select funnel or command |
| Enter | Run command |
| Esc | Return to Home |
| Prompt | Type command or PRISM intent |

Status bar shows **TERMINAL ONLY** + **LIVE · :8545 · port-fed** when connected.

---

## Funnels (complete)

### PRISM Intelligence
`query` · `predict` · `validate` · `trace` · `stats` · `prism cache`

### HELIX Execution
`helix status` · `helix execute` · `helix simulate` · `helix liquidity`

### Skills Runtime
`skill run` · `skill momentum` · `skill payment` · `skill risk`

### QA Trading
`exchange probe binance|coinbase|kraken` · `exchange qa scan`

### Full Pipeline
`pipeline` · `pack status` · `pack sync`

### Chain — clrty-1
`chain ready` · `chain status` · `chain indexer` · `chain dx list`

### Commons *(entitled · panel only)*
- **Panel:** 1GB cache, paste, copy, library, P2P send, tax ledger
- **Commands:** `prism commons inbox` · `prism commons receive <id>`
- **Blocked:** send, cache, library, paste via CLI or typed commands

### Wallet
`wallet status` · `wallet balance` · `wallet registry` · `wallet nodes` · `wallet connect --address 0x…`

### Account / Investor / Partner / Settlement / Identity
`account status` · `account kyc` · `investor walkthrough`  
`partner status` · `partner keys`  
`settlement status` · `settlement attest`  
`identity status` · `identity wallet`

### Integrations · Governance · Nodes · Ledger · Config · Updates
`integrations` · `integrations probe`  
`governance status` · `governance proposals`  
`nodes list` · `nodes probe`  
`trace` · `stats` · `prism validate`  
`config api` · `updates check`

---

## API endpoints (port-fed)

| Endpoint | Terminal use |
|----------|----------------|
| `GET /v1/status` | Chain status |
| `GET /v1/prism/status` | PRISM cache, port probe |
| `GET /v1/helix/status` | HELIX kernel |
| `POST /v1/helix/intents` | Execute swap |
| `GET /v1/commons/cache/status` | Commons cache bar |
| `POST /v1/commons/cache/paste` | Paste to cache |
| `GET /v1/commons/library` | Overall library |
| `GET /v1/commons/ledger` | Tax-logged transfers |
| `POST /v1/commons/transfer` | P2P send (panel only) |
| `GET /v1/commons/inbox/:user` | Inbox |
| `POST /v1/commons/receive` | Receive transfer |
| `GET /v1/wallet/registry` | Wallet funnel |
| `GET /v1/account/status` | Account / entitlements |

---

## Launch commands

| Command | Purpose |
|---------|---------|
| `make launch-prism` | Ensure API + gate sync + terminal dev |
| `make launch-prism-live` | Build + API + gate + terminal |
| `make launch-prism-local` | Offline stubs only (no port) |
| `clrt gate sync` | Sync gate env to terminal |
| `clrt gate password` | Personal access code |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **NO PORT** banner | `cargo run -p clrty-api` or `make launch-prism` |
| Commons disabled | Connect :8545; entitled access required |
| Gate blocked | Unlock via operator / personal code / investor |
| `PORT REQUIRED` on command | Start clrty-api; wait for LIVE · :8545 |
| Wrong launch mode | Use `make launch-prism`, not `launch-prism-local` |

---

See also: [FULL_USAGE.md](./FULL_USAGE.md) · [ALL_COMMANDS.md](./ALL_COMMANDS.md)
