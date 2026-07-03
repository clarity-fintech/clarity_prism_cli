# Downloads — CLRTY PRISM + HELIX

Customer download index for the full PRISM + HELIX ecosystem.

---

## Git repository (recommended)

**URL:** https://github.com/clarity-fintech/clarity_prism_cli

Includes: all `@clrt/*` packages, CLI source, docs, portal, verify scripts, examples.

```bash
git clone https://github.com/clarity-fintech/clarity_prism_cli.git
cd clarity-prism-cli
npm install
npm run build
bash npm-install-local.sh
make verify
```

---

## ZIP bundle

| File | SHA256 | Contents |
|------|--------|----------|
| `dist/clarity-prism-full.zip` | [`dist/SHA256SUMS.txt`](dist/SHA256SUMS.txt) | Full PRISM + HELIX CLI, SDK packages, docs, portal, verify scripts, examples, and offline install assets |

Build locally:

```bash
make build-kit
```

Extract and install:

```bash
unzip clarity-prism-full.zip -d clarity-prism
cd clarity-prism
npm install && npm run build
bash npm-install-local.sh
```

---

## What you get

| Component | Path | Description |
|-----------|------|-------------|
| Global CLI | `apps/cli` | `clrt` command |
| PRISM SDK | `packages/prism-sdk` | `PrismClient` API |
| HELIX stack | `packages/helix-*` | Execution engines |
| Skills | `packages/skills-sdk` | Skill runtime |
| Pipeline | `packages/prism-helix` | PRISM → HELIX bridge |
| Docs | `docs/` | Full usage + CLI reference |
| Examples | `examples/` | Runnable SDK scripts |
| Portal | `portal/index.html` | Download + quickstart UI |
| Verify | `make verify` | Build + smoke + ZIP gate |

---

## npm workspace install

```bash
npm install
npm run build
npm install -g ./apps/cli
```

Individual packages:

```bash
npm install ./packages/prism-sdk
npm install ./packages/prism-helix
npm install ./packages/skills-sdk
```

Public npm registry publish under `@clrt` scope is planned; v1 ships via Git + ZIP.

---

## Documentation after install

| Start here | Link |
|------------|------|
| 5-minute quickstart | [docs/QUICKSTART.md](./docs/QUICKSTART.md) |
| Full usage guide | [docs/FULL_USAGE.md](./docs/FULL_USAGE.md) |
| Complete CLI reference | [docs/CLI_REFERENCE.md](./docs/CLI_REFERENCE.md) |
| SDK packages | [docs/PACKAGES.md](./docs/PACKAGES.md) |
| Workflows | [docs/EXAMPLES.md](./docs/EXAMPLES.md) |

---

## Portal

Open `portal/index.html` in a browser for download links, install steps, and command reference.

```bash
cd portal && python3 -m http.server 8080
# Visit http://localhost:8080
```
