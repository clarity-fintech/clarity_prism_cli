# CLI Reference

Global command: `clrt`

## Color scheme

| State | Color |
|-------|-------|
| PRISM intelligence | Purple |
| HELIX execution | Blue |
| Risk / guardrails | Red |
| Success | Green |
| Warning | Yellow |

## PRISM

```bash
clrt prism query "arbitrage opportunities"
clrt prism predict --capital=1000
clrt prism cache status
clrt prism validate --intent arbitrage_scan --capital 1000
clrt prism trace -n 20
clrt prism stats
```

## HELIX

```bash
clrt helix status
clrt helix execute swap --from SOL --to USDC --amount 1000
clrt helix simulate swap --amount 500
clrt helix liquidity scan SOL/USDC
```

## Skills

```bash
clrt skill install market-arbitrage
clrt skill run market-arbitrage --capital 1000
clrt skill status
clrt skill locks
```

Built-in skills: `market-arbitrage`, `trend-momentum`, `payment-executor`, `risk-manager`

## Full pipeline

```bash
clrt run "optimize portfolio yield" --capital 5000
```

## Environment

| Variable | Description |
|----------|-------------|
| `CLRTY_API_URL` | Optional live API base URL |
| `CLRTY_API_KEY` | Optional API key |
| `PRISM_REPO_DIR` | Mini-git ledger directory (default `~/.clrt/prism/repo`) |
