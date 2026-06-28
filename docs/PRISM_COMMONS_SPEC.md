# PRISM Commons Protocol (v1 stub)

P2P research and primitive sharing for CLRTY PRISM.

## Storage

- Local CAS: `~/.clrt/prism/commons/`
- Package: `@clrt/commons-cas`

## Commands

```bash
clrt prism commons put <file>      # SHA-256 CID
clrt prism commons get <cid>
clrt prism commons discover <topic>
clrt prism commons peers
```

## Security

- AES-GCM encryption for shared assets (client-side)
- SHA-256 integrity before execution
- Bandwidth throttling separate from market-data channels

## Roadmap

Production libp2p mesh and GHT federation are stubbed in Tier 5 v1.
