# PRISM Terminal UI

Visual terminal interface matching the PRISM CLI design — React + Vite.

## Run

```bash
# From repo root (after npm install + package build)
npm run dev:terminal
```

Open **http://localhost:5174**

## Build static portal

```bash
npm run build:terminal
# Output: apps/prism-cli/dist/
```

## PRISM integration

| Menu item | Linked PRISM module |
|-----------|---------------------|
| Chat with PRISM | `@clrt/prism-core` IntentEngine + API `/v1/prism/intent-aware` |
| Run a command | Mirrors `clrt` CLI commands + live preview |
| View recent activity | Browser ledger (localStorage) — mirrors `clrt prism trace` |
| Configure settings | `CLRTY_API_URL`, `CLRTY_API_KEY` for live mode |
| Manage integrations | `@clrt/prism-sdk`, `@clrt/prism-helix`, `@clrt/helix-core` |
| Help | Links to `docs/` reference |

## Chat commands

- Natural language → PRISM intent query
- `predict 5000` — capital forecast
- `validate my claim` — adversarial QA
- `trace` / `stats` — ledger metrics
- `clrt prism query "..."` — shows terminal command

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS v4
- framer-motion, lucide-react, react-hotkeys-hook
- CSS-only PRISM banner (SVG pyramid + gradient dither typography)
