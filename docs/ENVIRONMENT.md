# Environment Variables

Complete configuration reference for CLI and SDK.

---

## Core variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `CLRTY_API_URL` | No | *(unset = local mode)* | Base URL for CLRTY API (no trailing slash) |
| `CLRTY_API_KEY` | No | *(unset)* | Bearer token sent as `Authorization: Bearer ...` |
| `PRISM_REPO_DIR` | No | `~/.clrt/prism/repo` | Mini-git ledger directory override |

---

## `CLRTY_API_URL`

Enables **live API mode** for PRISM and HELIX clients.

**Example values:**

```bash
# Local clrty-api dev server
export CLRTY_API_URL=http://127.0.0.1:8787

# Remote staging
export CLRTY_API_URL=https://api.staging.clrty.example
```

**Endpoints used when set:**

| Path | Method | Consumer |
|------|--------|----------|
| `/v1/prism/status` | GET | Health check |
| `/v1/prism/intent-aware` | POST | `PrismClient.query()`, `clrt prism query` |
| `/v1/helix/status` | GET | `clrt helix status` |
| `/v1/helix/intents` | POST | Intent submission |
| `/v1/helix/net/preview` | GET | Net settlement preview |

**Fallback:** If URL is unset or request fails, all clients use **local deterministic mode**.

---

## `CLRTY_API_KEY`

Optional authentication token for protected API deployments.

```bash
export CLRTY_API_KEY=your_token_here
```

Sent on every API request:

```
Authorization: Bearer your_token_here
```

---

## `PRISM_REPO_DIR`

Override the mini-git ledger storage location.

```bash
export PRISM_REPO_DIR=/data/prism/ledger
```

**Files created:**

| File | Description |
|------|-------------|
| `events.log` | Append-only JSONL event chain |

Used by: `clrt prism validate`, `clrt prism trace`, `clrt prism stats`, and all SDK operations that log events.

**CI tip:** Point to a temp dir in smoke tests:

```bash
export PRISM_REPO_DIR=/tmp/prism-test-repo
clrt prism query "test"
```

---

## Using `.env` file

Copy the template:

```bash
cp .env.example .env
```

`.env.example` contents:

```env
CLRTY_API_URL=http://127.0.0.1:8787
CLRTY_API_KEY=
PRISM_REPO_DIR=
```

Load before running CLI:

```bash
set -a && source .env && set +a
clrt prism query "arbitrage opportunities"
```

Or export manually:

```bash
export $(grep -v '^#' .env | xargs)
```

---

## SDK constructor overrides

Environment variables can be overridden per-client:

```typescript
const prism = new PrismClient({
  apiUrl: "http://custom:8787",
  apiKey: "override_key",
  network: "mainnet",
  nodeType: "private",
});

const helix = new HelixClient({
  apiUrl: process.env.CLRTY_API_URL,
  apiKey: process.env.CLRTY_API_KEY,
});
```

Constructor values take precedence over environment when both are set.

---

## Node.js requirements

| Requirement | Minimum |
|-------------|---------|
| Node.js | 18 |
| npm | 9 |

Check:

```bash
node --version
npm --version
```
