#!/usr/bin/env node
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

execSync("node scripts/sync_gate_env.mjs", { cwd: root, stdio: "inherit" });
execSync("npm run build -w prism-cli", { cwd: root, stdio: "inherit" });
