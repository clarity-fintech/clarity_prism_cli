#!/usr/bin/env node
/**
 * Safe dev launcher for prism-cli terminal UI.
 * Do NOT put "# comment" inside npm script strings — Vite treats "#" as a path.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = join(root, "apps", "prism-cli");

// Remove accidental "#" directory if a bad npm script created it
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

console.log("PRISM terminal UI → http://localhost:5174 (next free port if busy)\n");

const child = spawn("npm", ["run", "dev", "-w", "prism-cli"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => process.exit(code ?? 0));
