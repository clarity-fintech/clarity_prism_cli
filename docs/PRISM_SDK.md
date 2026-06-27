# PRISM SDK

Intelligent RPC + execution-aware data layer for the CLRTY ecosystem.

## Install

```bash
npm install @clrt/prism-sdk
# or from this repo:
npm install ./packages/prism-sdk
```

## Quick start

```javascript
import { PrismClient } from "@clrt/prism-sdk";

const prism = new PrismClient({
  apiKey: process.env.CLRTY_API_KEY,
  network: "mainnet",
});

const result = await prism.query({
  intent: "portfolio_state",
  address: "USER_WALLET_ADDRESS",
  context: { includeDeFi: true },
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

## Metrics

```javascript
const stats = await prism.metrics();
```

## API endpoints (when CLRTY_API_URL set)

- `GET /v1/prism/status`
- `POST /v1/prism/intent-aware`
