# CLRTY PRISM + HELIX

Intelligent routing and execution operating system for developers.

- **PRISM** decides what should happen (intent, prediction, PoR)
- **HELIX** decides how it should happen (routing, MEV protection, execution)
- **SKILLS** decide what value it creates (modular deterministic runtime)

## Install

### From Git (full access)

```bash
git clone https://github.com/williamsnameiswill/clarity-prism-cli.git
cd clarity-prism-cli
npm install
npm run build
bash npm-install-local.sh
clrt --help
```

### From ZIP download

Extract `dist/clarity-prism-full.zip`, then:

```bash
bash npm-install-local.sh
```

### Optional: live API wiring

```bash
cp .env.example .env
# CLRTY_API_URL=http://127.0.0.1:8787
```

## Quick start

```bash
clrt prism query "arbitrage opportunities"
clrt helix execute swap --from SOL --to USDC --amount 1000
clrt skill run market-arbitrage --capital 1000
clrt run "optimize portfolio yield" --capital 5000
```

## Package tree

| Package | Description |
|---------|-------------|
| `@clrt/prism-core` | Intent engine, cache, ledger |
| `@clrt/prism-sdk` | Developer SDK |
| `@clrt/helix-core` | Execution client |
| `@clrt/prism-helix` | PRISM → HELIX pipeline |
| `@clrt/skills-sdk` | Skill runtime |
| `@clrt/cli` | Global CLI |

See [DOWNLOADS.md](./DOWNLOADS.md) and [docs/CLI_REFERENCE.md](./docs/CLI_REFERENCE.md).

## Verify

```bash
make verify
```

## License

MIT
