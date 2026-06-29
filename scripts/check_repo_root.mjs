#!/usr/bin/env node
/** Warn if npm is run from nested clarity-prism-cli/clarity-prism-cli (stale v1.0.1 copy). */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const nested = join(root, "clarity-prism-cli", "package.json");

if (existsSync(nested)) {
  console.warn(
    "\n[clarity-prism-cli] WARNING: nested ./clarity-prism-cli/ detected (stale copy).\n" +
      "  Run commands from the repo root, not clarity-prism-cli/clarity-prism-cli/.\n" +
      "  Remove it: rm -rf clarity-prism-cli\n"
  );
}

try {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  if (pkg.version !== "1.0.2") {
    console.warn(`[clarity-prism-cli] Expected root version 1.0.2, got ${pkg.version}`);
  }
} catch {
  /* ignore */
}
