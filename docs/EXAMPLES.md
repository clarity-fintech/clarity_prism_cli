# Examples — Copy-Paste Workflows

End-to-end workflows for common CLRTY PRISM + HELIX tasks.

---

## 1. First-time developer setup

```bash
git clone https://github.com/clarity-fintech/clarity_prism_cli.git
cd clarity-prism-cli
npm install
npm run build
bash npm-install-local.sh
make verify
clrt --version
```

---

## 2. Arbitrage research workflow

Scan intent → validate claim → simulate execution → run skill.

```bash
# Step 1 — PRISM intent query
clrt prism query "arbitrage opportunities SOL USDC"

# Step 2 — Adversarial validation (logs to mini-git)
clrt prism validate \
  --claim "SOL/USDC cross-venue spread exceeds 40bps" \
  --intent arbitrage_scan \
  --capital 1000

# Step 3 — Liquidity depth check
clrt helix liquidity scan SOL/USDC

# Step 4 — Simulate swap before execution
clrt helix simulate swap --from SOL --to USDC --amount 1000

# Step 5 — Run arbitrage skill
clrt skill install market-arbitrage
clrt skill run market-arbitrage --capital 1000 --max-exposure 0.2

# Step 6 — Review audit trail
clrt prism trace -n 10
clrt prism stats
```

---

## 3. Portfolio yield optimization (full pipeline)

Single command for PRISM → HELIX → chain:

```bash
clrt run "optimize portfolio yield" --capital 5000
```

Manual step-by-step equivalent:

```bash
clrt prism predict --capital=5000
clrt helix liquidity scan SOL/USDC
clrt helix simulate swap --from USDC --to SOL --amount 5000
clrt helix execute swap --from USDC --to SOL --amount 5000
clrt prism stats
```

---

## 4. Live API mode workflow

Requires running `clrty-api` locally or remote.

```bash
cp .env.example .env
# Edit CLRTY_API_URL and CLRTY_API_KEY

export $(grep -v '^#' .env | xargs)

# Confirm API reachability
curl -s "$CLRTY_API_URL/v1/prism/status" | head

# Run queries in API mode
clrt prism query "portfolio_state"
clrt helix status
```

When API responds, JSON includes `"mode": "api"`.

---

## 5. Risk-managed skill execution

```bash
clrt skill install risk-manager
clrt skill install market-arbitrage

# Check risk first
clrt skill run risk-manager --capital 10000 --max-exposure 0.15

# Execute only if within limits
clrt skill run market-arbitrage --capital 10000 --max-exposure 0.15

clrt skill locks
clrt skill status
```

---

## 6. Programmatic SDK — full pipeline

Create `examples/pipeline.mjs`:

```javascript
import { PrismHelix } from "@clrt/prism-helix";

const pipeline = new PrismHelix({
  apiUrl: process.env.CLRTY_API_URL,
  apiKey: process.env.CLRTY_API_KEY,
});

const result = await pipeline.execute({
  intent: "optimize yield strategy",
  capital: 5000,
  from: "USDC",
  to: "SOL",
  amount: 5000,
});

for (const step of result.steps) {
  console.log(`[${step.layer}] ${step.action}`);
}
console.log("Commit:", result.chain_commit);
```

Run:

```bash
node examples/pipeline.mjs
```

---

## 7. Programmatic SDK — PRISM query only

```javascript
import { PrismClient } from "@clrt/prism-sdk";

const prism = new PrismClient({ network: "mainnet" });

const portfolio = await prism.query({
  intent: "portfolio_state",
  address: "YOUR_WALLET",
  context: { includeDeFi: true },
});

console.log(portfolio.confidence, portfolio.suggested_routes);

const stats = await prism.metrics();
console.log(stats);
```

---

## 8. Programmatic SDK — skill agent

```javascript
import { SkillAgent } from "@clrt/skills-sdk";

const agent = new SkillAgent();
await agent.use("market-arbitrage-skill", { capital: 1000, maxExposure: 0.2 });
await agent.use("risk-manager-skill", { capital: 1000, maxExposure: 0.2 });
console.log(agent.locks());
```

---

## 9. CI / smoke test (matches `make verify`)

```bash
export PRISM_REPO_DIR=/tmp/prism-ci-repo
rm -rf "$PRISM_REPO_DIR"

npm run build
bash scripts/cli_smoke.sh
node scripts/verify_packages.mjs
bash scripts/build_kit.sh

test -f dist/clarity-prism-full.zip && echo "ZIP OK"
```

---

## 10. Private query (SDK)

```javascript
import { PrismClient } from "@clrt/prism-sdk";

const prism = new PrismClient({ nodeType: "private" });

const data = await prism.query({
  intent: "arbitrage_scan",
  private: true,
});
// Strategy intent obfuscated via @clrt/prism-secure
```

---

## 11. Cross-chain query (SDK)

```javascript
const data = await prism.query({
  intent: "portfolio_state",
  chains: ["solana", "ethereum"],
  context: { capital: 25000 },
});
```

---

## 12. Ledger inspection

```bash
# Default ledger location
cat ~/.clrt/prism/repo/events.log | tail -5 | jq .

# Custom ledger
export PRISM_REPO_DIR=/tmp/my-prism-repo
clrt prism query "test"
clrt prism trace -n 5
```

Each line is a JSON event with `parent_hash` and `content_hash` forming an immutable chain.
