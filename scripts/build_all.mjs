#!/usr/bin/env node
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const order = [
  "@clrt/prism-core",
  "@clrt/prism-models",
  "@clrt/prism-secure",
  "@clrt/helix-core",
  "@clrt/helix-routing",
  "@clrt/helix-protect",
  "@clrt/helix-ai",
  "@clrt/prism-nodes",
  "@clrt/prism-sdk",
  "@clrt/helix-sim",
  "@clrt/prism-helix",
  "@clrt/skill-marketplace",
  "@clrt/skills-sdk",
  "@clrt/primitive-registry",
  "@clrt/repo-sync",
  "@clrt/account-profile",
  "@clrt/market-feeds",
  "@clrt/commons-cas",
  "@clrt/cli",
];

for (const pkg of order) {
  console.log(`Building ${pkg}...`);
  execSync(`npm run build -w ${pkg}`, { cwd: root, stdio: "inherit" });
}

console.log("Build complete.");
