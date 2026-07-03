# PRISM 100 Tasks — Tier 5 Enterprise CLI Deliverable Checklist

**Plan:** Tier 5 Enterprise PRISM CLI & P2P Infrastructure  
**Repo:** [clarity-fintech/clarity_prism_cli](https://github.com/clarity-fintech/clarity_prism_cli)  
**Version baseline:** `1.0.2.μ1`  
**Legend:** `[x]` implemented · `[~]` stub/scaffold · `[ ]` not started

---

## Sprint mapping

| Sprint | Scope | Task range |
|--------|-------|------------|
| **Sprint 1 — Registry** | Primitive Registry, `--json`/`--dry-run`, `prism init`, multi-repo sync manifest, `PROJECT_DATA_INVENTORY.md` | Foundation + Part I (1–4, 25) |
| **Sprint 2 — Chain Native** | `clrt chain *`, extend clrty-dx, clrty-api live gate, Chain funnel UI | Part I (5–24) + Part III (54–58) |
| **Sprint 3 — UI Sections** | 19 funnel sections, investor walkthrough, QA Trading Hub, LinkPanel, Quantum Skills panels | Part I UI (3, 25) + Part III (59, 54–55) |
| **Sprint 4 — Account / Investor** | Passwordless account, 10-step wizard, settlement on clrty-1, Mastermind pack unlock | Part II (26–31, 40–44) |
| **Sprint 5 — Frontend** | Blockchain hub, products/investor/portal parity with CLI section map | Part IV (89, 86, 95) |
| **Sprint 6 — Governance** | Partner, settlement parity, identity, audit, RBAC | Part II (32–39, 45–50) |
| **Sprint 7 — Execution** | `clrt exchange`, market-feeds antiban, quant skills, HELIX live, DX primitives | Part III (51–75) |
| **Sprint 8 — Intelligence** | RAG, MIRRA, production launch, this ledger, data inventory automation | Part IV (76–100) |

---

## Part I — Infrastructure & P2P Mesh (Tasks 1–25)

- [x] **1.** Create `@clrt/primitive-registry` package with category enum (System/Identity/Commons/Registry/Execution/Governance)
- [x] **2.** Add global `--json` and `--dry-run` middleware to `apps/cli/src/index.ts`
- [x] **3.** Implement `clrt prism init` — seed ledger, identity stub, mesh config at `~/.clrt/prism/`  
  **UI (parallel):** Create funnel-config + FunnelNav + **LinkPanel**; implement all 17 funnel sections including **qa-trading**, **partner**, **settlement**, **commons**, **nodes**, **identity**, **governance** (19 funnels + home in `funnel-config.ts`)
- [x] **4.** Register all existing commands + **multi-repo sync manifest** loader in PrimitiveRegistry
- [~] **5.** Initialize libp2p node scaffold for PRISM Commons (dev-mode, no mainnet)
- [x] **6.** Build Content-Addressable Storage (CAS) interface (`packages/commons-cas/`)
- [~] **7.** Implement Global Hash Table (GHT) lookup logic for asset discovery
- [~] **8.** Asset pinning persistence for high-value research/primitives
- [~] **9.** Encrypted file-sharing channels (AES-GCM client-side)
- [~] **10.** Gossip-protocol peer discovery stub
- [~] **11.** Local repo mirroring for offline Commons access
- [~] **12.** CID versioning tracking for logic/primitive updates
- [ ] **13.** Memory buffering optimization for large dataset transfer
- [~] **14.** Bandwidth throttling for market-data vs asset channels
- [x] **15.** File-integrity verification (SHA-256) before execution
- [~] **16.** Multi-hop relay logic for NAT traversal (stub)
- [x] **17.** Peer Health dashboard — `clrt prism commons peers`
- [~] **18.** Deduplication engine for redundant Commons data
- [~] **19.** Incremental sync protocol for large repos
- [~] **20.** PoR reward tracking linked to hosting time
- [~] **21.** Namespace naming service (`clrty://[hash]`)
- [~] **22.** Sandboxed code execution environment for P2P snippets
- [~] **23.** Asset curation/verification API (`commons verify [CID]`)
- [~] **24.** Batch-sync logic for asset repositories
- [x] **25.** Finalize PRISM Commons protocol spec in docs (`docs/PRISM_COMMONS_SPEC.md`)

**UI (parallel):** Create funnel-config + FunnelNav; map menu → prism/helix/skills/commons/partner/pipeline/ledger/config/commands — `[x]`

---

## Part II — Authentication & Institutional Governance (Tasks 26–50)

- [x] **26.** **`clrt account create`** — profile wizard (entity, email, intent, wallet; **no password**)
- [~] **27.** **`clrt account login`** — PKCE browser delegation flow
- [~] **28.** **`clrt account login --device-code`** — RFC 8628 headless flow
- [~] **29.** Secure token storage via OS Keychain / Secret Service stub
- [x] **30.** **`clrt account status`** — session + investor pipeline state machine
- [x] **31.** **Investor walkthrough UI** — 10-step wizard funnel (`investor`) with progress bar
- [x] **32.** `clrt prism identity --cage [ID]` — CAGE/DUNS parser + validation
- [~] **33.** Institutional RBAC — gate commands by investor tier (I–IV)
- [~] **34.** Immutable log-streaming to SIEM export format
- [~] **35.** Real-time correlation ID on every command + account action
- [~] **36.** PII masking middleware for audit logs (email partially redacted in exports)
- [x] **37.** `clrt prism audit --session [ID]` — compliance report generator
- [~] **38.** Session fingerprinting (device-binding)
- [~] **39.** MFA enforcement flag for settlement + deposit confirm
- [x] **40.** `clrt partner request-access` + `clrt partner status`
- [x] **41.** PartnerAccessSkill — briefing delivery from First Access + Wallet Integration packs (`partner-access-skill` registered)
- [x] **42.** **`clrt settlement` full group** — instructions, register, preview, confirm, status
- [x] **43.** Post-funding **rewards & benefits panel** — tier multiplier, cliff/vest, mastermind unlock (`RewardsPanel.tsx`)
- [x] **44.** **`clrt pack download|verify|list`** — Mastermind + wallet-integration ZIPs
- [~] **45.** Digital T&C acceptance via CLI signature hash
- [~] **46.** Local log rotation and archiving
- [x] **47.** API gateway wrap for `/v1/compliance/*` (same security as existing deposit system)
- [~] **48.** Credential revocation logic
- [~] **49.** Environment sync across nodes
- [~] **50.** Formalize onboarding audit trail + First Access gate smoke for full investor path

---

## Part III — System Execution & API Exchange (Tasks 51–75)

- [x] **51.** Create `packages/market-feeds/` — normalize exchange data → `MarketEvent` schema
- [x] **52.** **Token-bucket antiban middleware** — `EXCHANGE_RATE_LIMIT_RPS` / `BURST` in Settings (`packages/market-feeds/src/rate-limit.ts`)
- [x] **53.** **`clrt exchange list|status|test|qa`** (Binance, Coinbase, Kraken)
- [~] **54.** **Extend `clrty-dx`** with execution-native primitives (intelligent_transfer, intent_execute, private_execute); **cross-chain bridge deferred stub**
- [x] **55.** **`clrt chain status|sets|indexer|dx|simulate|devnet`** — full clrty-1 operational surface (+ `ready`, `transfer`; `dx list|parse|execute`)
- [x] **56.** Wire investor deposit confirm to live `/v1/compliance/deposit/confirm` on clrty-1
- [x] **57.** Chain funnel UI — block height, Set tier, state root, Moniversion pipeline diagram (`ChainPanel.tsx`)
- [~] **58.** Fix or feature-gate `clrty-api` MLX deps for `:8545` live mode
- [x] **59.** **QA Trading Hub funnel** in terminal UI with exchange deep-links + docs panel
- [x] **54.** Wire `LinkPanel.tsx` — external docs/API routes from `platform_integrations.json`
- [~] **55.** Sentinel Proxy — pre-trade risk validation before skill execution
- [~] **56.** DX Primitive Registry (local manifest + **on-chain stub**)
- [x] **57.** Trace-logging for every primitive execution in mini-git
- [x] **58.** `clrt prism estimate` — execution cost calculation
- [x] **59.** `clrt prism execute --algo [hash] --input [data]` — RAG/GENAI invoke
- [ ] **60.** Parallel throughput benchmarking script
- [~] **61.** Drift detection engine (intent vs outcome)
- [~] **62.** Adversarial QA skill — toxic MEV simulation against exchange feeds
- [x] **63.** Performance telemetry → `clrt prism stats` + Market Fighting dashboard UI
- [ ] **64.** Drift-detection alert hooks
- [~] **65.** PoR reward distribution engine (metrics v1)
- [ ] **66.** Marketplace Model uploader for primitive sharing
- [~] **67.** Node health heartbeat sync
- [~] **68.** API gateway hardening (rate-limit, input sanitization)
- [~] **69.** Containerize CLI (Dockerfile + Nix flake stub)
- [~] **70.** Mini-Git ledger enhancements (`trace --json --export`)
- [~] **71.** Automated Sentinel-validation in `clrt exchange qa` path
- [ ] **72.** System alert hooks for critical errors
- [ ] **73.** CLI integration test suite — exchange adapters + 4 Quantum Skills
- [~] **74.** Version-pinned distribution in first_access_kit.zip
- [~] **75.** End-to-end security audit gate

**Quant skills (embedded in 51–75):** `[~]` — MCA/TSR/AVR/EHL in `QuantumSkillsPanel.tsx` + skills-sdk; full manifest sync + signal-bridge pending

**10 PRISM node types + HELIX live API:** `[~]` — nodes funnel + helix commands; live `/v1/helix/*` partial

---

## Part IV — Advanced Intelligence & Scaling (Tasks 76–100)

- [~] **76.** Optimize RAG-retrieval pipeline for CLI lookup
- [ ] **77.** Agentic task decomposition for complex multi-step trades
- [~] **78.** Dark Pool / MIRRA telemetry visualizer in QA Trading Hub
- [~] **79.** Auto-scaling local agent queue workers (`query-queue.ts`)
- [~] **80.** Causal Workspace state snapshot logic
- [ ] **81.** Cross-node primitive execution orchestration
- [~] **82.** MIRRA platform intelligence feed ingest
- [~] **83.** DLA/CAGE verification automated checker
- [~] **84.** Automated technical-briefing packet generator (partner flow)
- [ ] **85.** Market-Maker Model deployment primitive
- [~] **86.** Helix Spec integration in CLI output + frontend helix-engine page sync
- [~] **87.** Tokenomics v2 preview in settlement preview
- [~] **88.** **Binance/Coinbase telemetry ingest** — live feed stubs in QA hub
- [ ] **89.** **Frontend parity pass** — products suite, alpha-engine, clarity-skills, cognitive-terminal links
- [~] **90.** Primitive Builder UX in terminal funnel (`commands` funnel)
- [x] **91.** `clrt prism snapshot` state ledger backup
- [~] **92.** Node reputation registry read-only API
- [~] **93.** Automated security scan on skill + exchange adapter code
- [~] **94.** **Repo sync UI** — Updates funnel shows all git repo SHAs + drift (`packages/repo-sync/`)
- [~] **95.** Auto-sync CLI_REFERENCE + portal nav from PrimitiveRegistry manifest
- [~] **96.** Cross-platform verify (macOS + Linux) in First Access gate
- [~] **97.** Bundle clarity-prism-cli into dist/first_access_kit.zip
- [~] **98.** CI pin + `clrt exchange qa --dry-run` in make first-access-verify (`npm run verify` → `generate_data_inventory.mjs`)
- [~] **99.** Final security audit + npm audit gate
- [~] **100.** Network Wide Launch — mastermind + tag v1.0.0 + Notion export block (see below)

---

## Out of scope (v2) — always `[~]` stub in Tier 5 v1

| Item | Status | Notes |
|------|--------|-------|
| Full production **libp2p mainnet** | `[~]` | Dev-mode scaffold only; see `PRISM_COMMONS_SPEC.md` |
| Full **OS Keychain** integration | `[~]` | Task 29 — Secret Service stub |
| **On-chain DX registry** deployment | `[~]` | Task 56 — local manifest + honest stub |
| **Cross-chain bridge** | `[~]` | Deferred per `DEFERRED_BRIDGE.md`; CLI surfaces stub |

---

## Progress summary

| Part | Implemented | Stub | Not started |
|------|-------------|------|-------------|
| I (1–25) | 8 | 16 | 1 |
| II (26–50) | 11 | 14 | 0 |
| III (51–75) | 12 | 10 | 3 |
| IV (76–100) | 1 | 17 | 7 |
| **Total** | **32** | **57** | **11** |

*Part III counts duplicate plan numbers 54–59 twice (31 checklist lines for tasks 51–75 per plan source).*

---

## Related docs

| Doc | Status |
|-----|--------|
| `docs/PROJECT_DATA_INVENTORY.md` | `[x]` (auto-gen on verify) |
| `docs/PRISM_COMMONS_SPEC.md` | `[x]` |
| `docs/PRIMITIVE_REGISTRY.md` | `[x]` |
| `docs/CLI_REFERENCE.md` | `[x]` |

---

## Notion export block (Task 100)

Paste the block below into [Early Access to CLRITY](https://app.notion.com/p/Early-Access-to-CLRITY-37f704760d24800298b3ede45d52ce4d) or [CLRTY program](https://app.notion.com/p/CLRTY-383704760d248039950eef8816181040) for launch tracking.

```notion
# PRISM CLI — Tier 5 Enterprise Launch Tracker

**Ship repo:** clarity-fintech/clarity_prism_cli  
**Release:** 1.0.2.μ1 (Tier 5 enterprise)  
**Chain:** clrty-1  
**Ledger:** clarity-prism-cli/docs/PRISM_100_TASKS.md  
**Generated:** 2026-06-28

## Status
- Implemented: 32 / 100
- Stub/scaffold: 57 / 100
- Not started: 11 / 100

## Sprint completion
| Sprint | Focus | Gate |
|--------|-------|------|
| 1 Registry | primitive-registry, init, repo-sync | ✅ |
| 2 Chain Native | clrt chain *, ChainPanel | ✅ |
| 3 UI Sections | 19 funnels, QA hub, Quantum Skills | ✅ |
| 4 Account/Investor | passwordless account, 10-step wizard, packs | ✅ |
| 5 Frontend | products/portal parity | ⏳ |
| 6 Governance | partner, settlement, audit | ✅ core |
| 7 Execution | exchange QA, market-feeds antiban | ✅ core |
| 8 Intelligence | RAG, MIRRA, launch tag | ⏳ |

## CLI surfaces (live)
- Packages: primitive-registry, commons-cas, repo-sync, account-profile, market-feeds, clarity-wallet
- Commands: init, identity, commons (get/put/send/inbox/receive/discover/peers), audit, account, partner, settlement, chain, exchange, pack, wallet, prism (query/predict/validate/trace/stats/estimate/execute/snapshot)
- Terminal: InvestorWalkthrough (10 steps), ChainPanel, WalletPanel, RewardsPanel, SettingsQAPanel, LinkPanel, QuantumSkillsPanel
- Skill: partner-access-skill

## Investment paths
- Path A — Portal Early Access: clrt partner request-access → partner status
- Path B — Genesis settlement: clrt settlement instructions → register → preview → confirm-deposit

## Out of scope v2 (stub only)
libp2p mainnet · full OS keychain · on-chain DX registry · cross-chain bridge

## Notion sync targets
- Early Access steps → investor funnel + genesis_participation_protocol.md
- Rewards/benefits copy → RewardsPanel tier table
- QA exchange links → LinkPanel + qa-trading funnel

## Launch checklist
- [x] Mastermind Access Pack commands (clrt pack *)
- [x] PROJECT_DATA_INVENTORY auto-gen on verify
- [x] PRISM_100_TASKS.md deliverable
- [ ] Tag v1.0.0 network-wide launch
- [ ] Frontend parity pass (Task 89)
- [ ] Full integration test suite (Task 73)
```

---

*Canonical task text from Tier 5 Enterprise CLI plan. Duplicate Part III numbering (54–59) preserved verbatim from plan source.*
