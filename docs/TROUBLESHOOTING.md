# Troubleshooting — PRISM CLI

## `fatal: destination path 'clarity-prism-cli' already exists`

You already cloned the repo. Use the existing folder instead of cloning again:

```bash
cd clarity-prism-cli
git pull
npm install
npm run build
```

Or clone to a different name:

```bash
git clone https://github.com/clarity-fintech/clarity_prism_cli.git clarity-prism-cli-2
```

Inside the CLRTY monorepo, the canonical copy is:

```bash
cd "/Users/william/\$CLRTY_PROJECT/clarity-prism-cli"
```

---

## `zsh: no matches found: @clrt/*`

zsh treats `*` as a glob. **Do not type `@clrt/*` in the shell.**

Use:

```bash
npm run build
```

That builds all workspace packages (`prism-core`, `helix-core`, `cli`, etc.) via `scripts/build_all.mjs`. No glob needed.

---

## Vite: project root contains the "#" character

**Cause:** A `#` comment was pasted **inside** `package.json` script strings, for example:

```json
"dev": "vite # → http://localhost:5174"
```

npm passes that to Vite, which creates or uses a path ending in `#`.

**Fix:**

1. Open `apps/prism-cli/package.json` and ensure scripts are **only**:

```json
"dev": "vite",
"build": "tsc -b && vite build"
```

2. Open root `package.json` — `dev:terminal` should be:

```json
"dev:terminal": "node scripts/dev-terminal.mjs"
```

3. Remove the stray directory if it exists:

```bash
rm -rf apps/prism-cli/'#'
```

4. Restart:

```bash
npm run dev:terminal
```

**Rule:** Put comments on their **own line** in docs, never inline in npm scripts:

```bash
# Terminal UI → http://localhost:5174
npm run dev:terminal
```

---

## Wrong port (5173 instead of 5174)

Vite prefers port **5174** but uses the next free port if 5174 is taken. Check the terminal output for the actual URL.

Free the port:

```bash
lsof -ti :5174 | xargs kill -9 2>/dev/null || true
npm run dev:terminal
```

---

## Path with `$` in directory name

Always quote paths:

```bash
cd "/Users/william/\$CLRTY_PROJECT/clarity-prism-cli"
```

---

## `clrt: command not found`

Build and install the CLI locally:

```bash
npm run build
bash npm-install-local.sh
```

Or run without global install:

```bash
node apps/cli/dist/index.js --help
```

---

## Live API mode

Use port **8545** (not 8787):

```bash
export CLRTY_API_URL=http://127.0.0.1:8545
cargo run -p clrty-api   # from CLRTY monorepo root, when build succeeds
```
