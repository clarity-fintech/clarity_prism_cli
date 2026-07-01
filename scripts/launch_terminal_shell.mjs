#!/usr/bin/env node
/**
 * Native PRISM terminal — full clrt CLI in this shell (no browser).
 */
import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = join(root, "apps/cli/dist/index.js");

console.log("PRISM terminal — syncing gate env…\n");
execSync("node scripts/sync_gate_env.mjs", { cwd: root, stdio: "inherit" });

console.log("\nEnsuring clrty-api feeds live data…\n");
try {
  execSync("bash scripts/ensure_api_running.sh", { cwd: root, stdio: "inherit" });
} catch {
  console.warn("⚠ clrty-api not ready — terminal will still run; start: cargo run -p clrty-api\n");
}

if (!existsSync(cliEntry)) {
  console.log("Building clrt CLI…\n");
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

console.log("\nPRISM TERMINAL — full CLI in this shell (no browser)\n");

const child = spawn(process.execPath, [cliEntry, "prism", "terminal"], {
  cwd: root,
  stdio: "inherit",
  env: {
    ...process.env,
    CLRTY_API_URL: process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
