#!/usr/bin/env node
/**
 * Safe dev launcher for prism-cli terminal UI.
 * Do NOT put "# comment" inside npm script strings — Vite treats "#" as a path.
 */
import { spawn, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "apps", "prism-cli");

try {
  const { rmSync, existsSync } = await import("node:fs");
  const bad = join(appDir, "#");
  if (existsSync(bad)) {
    rmSync(bad, { recursive: true, force: true });
    console.warn("Removed stray apps/prism-cli/# directory (from invalid npm script comment).");
  }
} catch {
  /* ignore */
}

console.log("Syncing PRISM gate env…");
execSync("node scripts/sync_gate_env.mjs", { cwd: root, stdio: "inherit" });

console.log("Ensuring clrty-api feeds terminal data…");
try {
  execSync("bash scripts/ensure_api_running.sh", { cwd: root, stdio: "inherit" });
} catch {
  console.warn("\n⚠ clrty-api not ready — terminal will retry port :8545. Start manually: cargo run -p clrty-api\n");
}

console.log("\nOptional browser UI → http://localhost:5174 (use make launch-prism-web)\n");

const child = spawn("npm", ["run", "dev", "-w", "prism-cli"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    CLRTY_API_URL: process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545",
  },
});

child.on("exit", (code) => process.exit(code ?? 0));
