# PRISM SDK — `@clrt/prism-sdk`

Intelligent RPC + execution-aware data layer.

## Install

```bash
npm install @clrt/prism-sdk
# from this repo:
npm install ./packages/prism-sdk
```

## Initialize

```javascript
import { PrismClient } from "@clrt/prism-sdk";

const prism = new PrismClient({
  apiKey: process.env.CLRTY_API_KEY,
  apiUrl: process.env.CLRTY_API_URL,
  network: "mainnet",        // devnet | testnet | mainnet
  nodeType: "low_latency",   // predictive | private | fusion
});
```

## Intent-based queries

| Intent | Description |
|--------|-------------|
| `portfolio_state` | Aggregated wallet + DeFi positions |
| `liquidity_opportunities` | Yield + LP opportunities |
| `risk_exposure` | Portfolio risk analysis |
| `transaction_optimize` | Pre-execution optimization |
| `market_snapshot` | Multi-source data fusion |
| `arbitrage_scan` | Cross-venue spread detection |

```javascript
const result = await prism.query({
  intent: "portfolio_state",
  address: "USER_WALLET",
  context: { includeDeFi: true, capital: 50000 },
});
```

**Response fields:** `intent`, `confidence`, `relevance_score`, `proof_of_relevance`, `suggested_routes`, `prefetch`, `capital_context`, `mode`.

## Execution-aware routing

```javascript
const tx = await prism.execute({
  intent: "swap",
  from: "USDC",
  to: "SOL",
  amount: 1000,
  optimize: true,
});
```

## Private queries

```javascript
await prism.query({ intent: "arbitrage_scan", private: true });
```

Uses `@clrt/prism-secure` for strategy obfuscation.

## Predictive prefetch

```javascript
await prism.enablePrediction({ address: "WALLET" });
```

## AI cache

```javascript
await prism.cache.configure({ mode: "adaptive" });
const status = prism.cache.status();
```

## Cross-chain

```javascript
await prism.query({
  intent: "portfolio_state",
  chains: ["solana", "ethereum"],
});
```

## Capital context

```javascript
await prism.query({
  intent: "yield_strategy",
  context: { capital: 50000, risk: "moderate" },
});
```

## Metrics

```javascript
const stats = await prism.metrics();
// latency_saved_ms, validation_pass_rate, cache_hit_rate, prediction_accuracy
```

## API endpoints (live mode)

- `GET /v1/prism/status`
- `POST /v1/prism/intent-aware`

See [ENVIRONMENT.md](./ENVIRONMENT.md).
