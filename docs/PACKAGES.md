# Package Reference — `@clrt/*` Monorepo

All packages live under `packages/` and install via npm workspaces.

---

## Package tree

```
@clrt/
├── prism-core          # Intent engine, cache, fusion, mini-git ledger
├── prism-nodes         # 8 named node adapters
├── prism-secure        # Private query + MEV obfuscation
├── prism-models        # PoR scoring + prediction models
├── prism-sdk           # Public developer SDK (PrismClient)
├── helix-core          # Execution client + swap engine
├── helix-routing       # Liquidity scan + slippage math
├── helix-protect       # MEV shield + private lanes
├── helix-sim           # Pre-trade path comparison
├── helix-ai            # Adaptive routing weights
├── skills-sdk          # Skill runtime + 4 built-in skills
├── skill-marketplace   # Skill registry manifest
├── prism-helix         # PRISM → HELIX pipeline bridge
└── cli                 # Global `clrt` command (apps/cli)
```

---

## Install from workspace

```bash
npm install ./packages/prism-sdk
npm install ./packages/prism-helix
npm install ./packages/skills-sdk
```

---

## `@clrt/prism-sdk`

### `PrismClient`

```typescript
import { PrismClient } from "@clrt/prism-sdk";

const prism = new PrismClient({
  apiKey: process.env.CLRTY_API_KEY,
  apiUrl: process.env.CLRTY_API_URL,
  network: "mainnet",           // devnet | testnet | mainnet
  nodeType: "low_latency",      // predictive | private | fusion
});
```

### Methods

| Method | Description |
|--------|-------------|
| `query(input)` | Intent-aware query with PoR scoring |
| `execute(opts)` | PRISM interpret + HELIX swap execution |
| `predict(capital)` | Capital outcome forecast |
| `enablePrediction({ address })` | Enable adaptive prefetch |
| `metrics()` | Ledger + cache aggregate stats |
| `cache.configure({ mode })` | Set cache mode |
| `rpc.getAccount({ address })` | Traditional RPC-style account read |

### Query example

```typescript
const result = await prism.query({
  intent: "portfolio_state",
  address: "WALLET_ADDRESS",
  context: { capital: 50000, includeDeFi: true },
  private: false,
  chains: ["solana", "ethereum"],
});
```

### Execute example

```typescript
const tx = await prism.execute({
  intent: "swap",
  from: "USDC",
  to: "SOL",
  amount: 1000,
  optimize: true,
});
```

---

## `@clrt/prism-helix`

### `PrismHelix`

```typescript
import { PrismHelix } from "@clrt/prism-helix";

const pipeline = new PrismHelix({ apiUrl: process.env.CLRTY_API_URL });

const result = await pipeline.execute({
  intent: "optimize yield strategy",
  capital: 5000,
  from: "USDC",
  to: "SOL",
  amount: 5000,
});

console.log(result.chain_commit);
console.log(result.steps);       // PRISM → HELIX → CHAIN trace
console.log(result.execution);   // swap result
```

---

## `@clrt/skills-sdk`

### `SkillAgent`

```typescript
import { SkillAgent } from "@clrt/skills-sdk";

const agent = new SkillAgent();
agent.install("market-arbitrage-skill");

const result = await agent.use("market-arbitrage-skill", {
  capital: 1000,
  maxExposure: 0.2,
});

console.log(result.status);  // ok | blocked | error
console.log(result.output);
```

Built-in skills: `market-arbitrage-skill`, `trend-momentum-skill`, `payment-executor-skill`, `risk-manager-skill`.

---

## `@clrt/prism-core`

Low-level engines and ledger:

```typescript
import {
  IntentEngine,
  CacheIntelligence,
  validateClaim,
  traceLog,
  computeStats,
  appendEvent,
} from "@clrt/prism-core";

const engine = new IntentEngine();
const result = engine.interpret({ intent: "arbitrage_scan", context: { capital: 1000 } });

const validation = validateClaim({
  claim: "Spread exceeds threshold",
  intent: "arbitrage_scan",
  capital: 1000,
});
```

---

## `@clrt/helix-core`

```typescript
import { HelixClient } from "@clrt/helix-core";

const helix = new HelixClient({ apiUrl: process.env.CLRTY_API_URL });

const status = await helix.status();
const swap = helix.executeSwap({ from: "SOL", to: "USDC", amount: 1000, optimize: true });
const sim = helix.simulateSwap({ from: "SOL", to: "USDC", amount: 500 });
```

---

## `@clrt/prism-nodes`

Eight named node runners:

```typescript
import { runNode, NODE_IDS } from "@clrt/prism-nodes";

const result = runNode("predictive-query-node", { intent: "market_snapshot" });
```

Node IDs: `predictive-query-node`, `intent-aware-rpc-node`, `state-compression-node`, `multi-source-fusion-node`, `capital-context-node`, `query-minimizer-node`, `ai-cache-node`, `cross-chain-shadow-node`.

---

## `@clrt/helix-routing`

```typescript
import { scanLiquidity, minimizeSlippage } from "@clrt/helix-routing";

const scan = scanLiquidity("SOL/USDC");
```

---

## `@clrt/helix-protect`

```typescript
import { applyProtection } from "@clrt/helix-protect";

const shield = applyProtection({ mevShield: true, privateLane: true, encryptPayload: true });
```

---

## `@clrt/helix-sim`

```typescript
import { comparePaths } from "@clrt/helix-sim";

const comparison = comparePaths({ from: "SOL", to: "USDC", amount: 1000 });
console.log(comparison.recommended);
```

---

## `@clrt/skill-marketplace`

```typescript
import { listSkills, getSkill } from "@clrt/skill-marketplace";

console.log(listSkills());
console.log(getSkill("market-arbitrage"));
```

---

## Build order

Packages must build in dependency order. Use:

```bash
npm run build   # runs scripts/build_all.mjs
```

Manual order: `prism-core` → `prism-models` → `prism-secure` → `helix-core` → … → `cli`.
