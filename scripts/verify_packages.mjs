#!/usr/bin/env node
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const packagesDir = join(root, "packages");
const appsDir = join(root, "apps");

const pkgDirs = [
  ...readdirSync(packagesDir).map((d) => join(packagesDir, d)),
  ...readdirSync(appsDir).map((d) => join(appsDir, d)),
];

let failed = 0;

console.log("Building workspace...");
try {
  execSync("npm run build", { cwd: root, stdio: "inherit" });
} catch {
  process.exit(1);
}

for (const dir of pkgDirs) {
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  const distMain = join(dir, "dist", "index.js");
  if (!existsSync(distMain)) {
    console.error(`FAIL: missing dist for ${pkg.name}`);
    failed++;
  } else {
    console.log(`OK: ${pkg.name}`);
  }
}

if (failed > 0) {
  console.error(`Verify failed: ${failed} package(s)`);
  process.exit(1);
}

console.log("All packages verified.");
