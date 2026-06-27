# HELIX SDK — Execution Stack

Smart routing, MEV protection, simulation, and adaptive execution.

## Packages

| Package | npm | Role |
|---------|-----|------|
| `@clrt/helix-core` | Execution client | Swaps, status, intent submit |
| `@clrt/helix-routing` | Route scan | Liquidity depth, slippage |
| `@clrt/helix-protect` | MEV shield | Private lanes, encryption flags |
| `@clrt/helix-sim` | Simulation | Path comparison before trade |
| `@clrt/helix-ai` | Adaptive | Historical weight tuning |

## Install

```bash
npm install ./packages/helix-core
npm install ./packages/prism-helix   # full PRISM → HELIX pipeline
```

## HelixClient

```javascript
import { HelixClient } from "@clrt/helix-core";

const helix = new HelixClient({
  apiUrl: process.env.CLRTY_API_URL,
  apiKey: process.env.CLRTY_API_KEY,
});

const status = await helix.status();
const swap = helix.executeSwap({
  from: "SOL",
  to: "USDC",
  amount: 1000,
  optimize: true,
});
const sim = helix.simulateSwap({ from: "SOL", to: "USDC", amount: 500 });
```

## Liquidity scan

```javascript
import { scanLiquidity } from "@clrt/helix-routing";

const scan = scanLiquidity("SOL/USDC");
console.log(scan.depth_usd, scan.best_route, scan.venues);
```

## MEV protection

```javascript
import { applyProtection } from "@clrt/helix-protect";

const shield = applyProtection({
  mevShield: true,
  privateLane: true,
  encryptPayload: true,
});
```

## Simulation

```javascript
import { comparePaths } from "@clrt/helix-sim";

const comparison = comparePaths({ from: "SOL", to: "USDC", amount: 1000 });
console.log(comparison.recommended, comparison.outcome_prediction);
```

## Full pipeline

```javascript
import { PrismHelix } from "@clrt/prism-helix";

const pipeline = new PrismHelix();
const result = await pipeline.execute({
  intent: "swap",
  capital: 1000,
  from: "SOL",
  to: "USDC",
  amount: 1000,
});
```

## API endpoints (live mode)

- `GET /v1/helix/status`
- `POST /v1/helix/intents`
- `GET /v1/helix/net/preview`

## CLI equivalents

| SDK | CLI |
|-----|-----|
| `helix.status()` | `clrt helix status` |
| `helix.executeSwap()` | `clrt helix execute swap` |
| `helix.simulateSwap()` | `clrt helix simulate swap` |
| `scanLiquidity()` | `clrt helix liquidity scan` |
| `PrismHelix.execute()` | `clrt run` |

See [CLI_REFERENCE.md](./CLI_REFERENCE.md).
