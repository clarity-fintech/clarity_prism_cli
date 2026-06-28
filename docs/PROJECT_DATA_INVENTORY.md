# CLRTY Project Data Inventory

Auto-sync target for `clrt prism sync --repos`. Canonical pins in monorepo `CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json`.

## GitHub repositories

| Repo | Role |
|------|------|
| [williamsnameiswill/clarity-prism-cli](https://github.com/williamsnameiswill/clarity-prism-cli) | Company CLI (ship target) |
| [theangelofwill/-CLRTY](https://github.com/theangelofwill/-CLRTY) | Monorepo substrate + API |
| [theangelofwill/CLRTY-WALLET-INTEGRATION](https://github.com/theangelofwill/CLRTY-WALLET-INTEGRATION) | Wallet SDK + AP-* packs |
| [theangelofwill/clarity-prism-cli](https://github.com/theangelofwill/clarity-prism-cli) | Public mirror |

## Monorepo manifests (`CLRTY_SUBSTRATE/boot/`)

- `first_access_manifest.json` — Mastermind pack
- `quant_skills_manifest.json` — MCA, TSR, AVR, EHL
- `helix_manifest.json` — HELIX-01..10
- `tokenomics_manifest.json` — supply, vesting, tiers
- `platform_integrations_manifest.json` — exchange slugs
- `clrty_rpc_methods_manifest.json` — RPC catalog
- `prism_repo_sync_manifest.json` — repo SHA pins

## Access packs

- `clarity-wallet/downloads/access_packs_manifest.json` — 28 AP-* packs
- `clarity-wallet/wallet-integration/manifests/` — 25 leverage nodes

## Investor docs (`docs/investor/`)

- `genesis_participation_protocol.md` — deposit flow (CLI canonical)
- `settlement_gatekeeper.md` — attestation + treasury
- `INVESTOR_DATA_ROOM_INDEX.md` — master index

## API (`clrty-api` :8545)

Chain: `/v1/status`, `/v1/sets/:address`, `/v1/indexer/clrty-l1`, `/v1/dx/*`  
Settlement: `/v1/compliance/*`  
PRISM/HELIX: `/v1/prism/*`, `/v1/helix/*`  
Integrations: `/v1/integrations/:slug/probe`
