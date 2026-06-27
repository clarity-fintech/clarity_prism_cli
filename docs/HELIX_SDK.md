# HELIX SDK

Execution optimizer, liquidity aggregator, and cross-chain routing layer.

## Packages

- `@clrt/helix-core` — client + swap execution
- `@clrt/helix-routing` — liquidity scan, slippage minimization
- `@clrt/helix-protect` — MEV protection, private lanes
- `@clrt/helix-sim` — pre-trade simulation
- `@clrt/helix-ai` — adaptive routing weights

## Quick start

```javascript
import { HelixClient } from "@clrt/helix-core";

const helix = new HelixClient({ apiUrl: process.env.CLRTY_API_URL });
const status = await helix.status();
const result = helix.executeSwap({
  from: "SOL",
  to: "USDC",
  amount: 1000,
  optimize: true,
});
```

## API endpoints (when CLRTY_API_URL set)

- `GET /v1/helix/status`
- `POST /v1/helix/intents`
- `GET /v1/helix/net/preview`

## Pipeline bridge

Use `@clrt/prism-helix` for full PRISM → HELIX → chain flow.
