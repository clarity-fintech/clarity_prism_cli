# Quickstart — 5 minutes to first command

## Prerequisites

- **Node.js 18+** (`node --version`)
- **npm 9+** (`npm --version`)
- **Git** (for clone install)

## Step 1 — Get the repo

```bash
git clone https://github.com/williamsnameiswill/clarity-prism-cli.git
cd clarity-prism-cli
```

If `clarity-prism-cli` already exists, `cd` into it and run `git pull` instead of cloning again.

Or extract `dist/clarity-prism-full.zip` from the [releases/download bundle](../DOWNLOADS.md).

## Step 2 — Install and build

```bash
npm install
npm run build
bash npm-install-local.sh
```

This installs the global `clrt` command linked to your local workspace.

Verify:

```bash
clrt --version
clrt --help
```

## Step 3 — Run your first commands

### PRISM — intent query (purple output)

```bash
clrt prism query "arbitrage opportunities"
```

Expected: intent classification, confidence %, suggested HELIX routes, JSON result block.

### HELIX — simulated swap (blue output)

```bash
clrt helix simulate swap --from SOL --to USDC --amount 500
```

Expected: route list, slippage %, savings %, `status: "simulated"`.

### Full pipeline — PRISM → HELIX → chain (green commit)

```bash
clrt run "optimize portfolio yield" --capital 5000
```

Expected: step trace through PRISM and HELIX layers, `chain_commit` reference.

## Step 4 — Optional live API

By default the CLI runs in **local deterministic mode** (no server required).

To wire a live CLRTY API:

```bash
cp .env.example .env
```

Edit `.env`:

```env
CLRTY_API_URL=http://127.0.0.1:8545
CLRTY_API_KEY=your_key_if_required
```

Export before running:

```bash
export $(grep -v '^#' .env | xargs)
clrt prism query "portfolio_state"
```

When the API responds, results include `"mode": "api"`.

## Step 5 — Verify the full ecosystem

```bash
make verify
```

Passes when: all 14 packages build, CLI smoke tests exit 0, ZIP bundle is produced.

## Step 6 — Visual terminal UI (optional)

```bash
# http://localhost:5174
npm run dev:terminal
```

Issues? See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

## Next steps

- [FULL_USAGE.md](./FULL_USAGE.md) — operational guide
- [CLI_REFERENCE.md](./CLI_REFERENCE.md) — complete command reference
- [EXAMPLES.md](./EXAMPLES.md) — trading, validation, and skill workflows
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) — clone, Vite `#`, zsh glob, ports
