#!/usr/bin/env node
/**
 * Full PRISM launch: sync gate env → optional API → terminal dev server.
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const live = args.includes("--live");
const build = args.includes("--build");
const skipApi = args.includes("--no-api");

console.log("PRISM launch — syncing gate env…\n");
execSync("node scripts/sync_gate_env.mjs", { cwd: root, stdio: "inherit" });

if (build) {
  console.log("\nPRISM launch — building CLI packages…\n");
  execSync("npm run build", { cwd: root, stdio: "inherit" });
}

if (live && !skipApi) {
  console.log("\nPRISM launch — ensuring clrty-api…\n");
  execSync("bash scripts/ensure_api_running.sh", { cwd: root, stdio: "inherit" });
}

const useWeb = args.includes("--web");

if (useWeb) {
  console.log("\nPRISM browser UI → http://localhost:5174\n");
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
} else {
  console.log("\nPRISM native terminal shell (full clrt, no browser)\n");
  execSync("node scripts/launch_terminal_shell.mjs", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      CLRTY_API_URL: process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545",
    },
  });
}
