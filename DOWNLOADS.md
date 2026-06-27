# Downloads — CLRTY PRISM + HELIX

## Git repository (recommended)

**URL:** https://github.com/williamsnameiswill/clarity-prism-cli

Full source, SDK packages, CLI, portal, and verify gates.

```bash
git clone https://github.com/williamsnameiswill/clarity-prism-cli.git
cd clarity-prism-cli
make verify
bash npm-install-local.sh
```

## ZIP bundle

| File | Description |
|------|-------------|
| `dist/clarity-prism-full.zip` | Complete ecosystem — packages, CLI, docs, portal |

Build locally:

```bash
make build-kit
```

## npm packages (local workspace)

All `@clrt/*` packages install from the monorepo workspace:

```bash
npm install
npm run build
npm install -g ./apps/cli
```

Public npm registry publish is planned; v1 ships via Git + ZIP.

## SDK install (programmatic)

```bash
npm install ./packages/prism-sdk
npm install ./packages/prism-helix
npm install ./packages/skills-sdk
```

## Portal

Open `portal/index.html` for download links and quickstart.
