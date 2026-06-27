# Architecture

## Layers

```
App / User
   ↓
PRISM SDK (@clrt/prism-sdk)
   ↓
PRISM Network (intent + PoR + cache)
   ↓
HELIX (@clrt/helix-core)
   ↓
CLRTY Chain / Solana
```

## Mini-git ledger (v1 local)

PRISM maintains an append-only event log with Merkle-style hashes:

- Location: `~/.clrt/prism/repo/events.log`
- Each event: `parent_hash`, `content_hash`, type, intent, evidence
- Commands: `clrt prism validate`, `clrt prism trace`, `clrt prism stats`

Adversarial validation follows MCA/TSR/AVR pattern:

1. **Trader** submits claim
2. **Sentinel** challenges intent drift
3. **AVR** gate authorizes or blocks commit

## Skills runtime

- One skill lock at a time
- Deterministic capital-aware execution
- Events logged to PRISM ledger

## Roadmap (v2)

- libp2p peer discovery and pub/sub
- IPFS content-addressable receipts
- CRDT merge for distributed ledger
- X402 orchestration for paid data transfer
