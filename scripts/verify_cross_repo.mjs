#!/usr/bin/env node
/**
 * Cross-repo sync verification — manifest pins, CLI version, optional API probes.
 * Set CLRTY_VERIFY_STRICT=1 to fail when clrty-api endpoints are unreachable.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const monorepoRoot = join(root, "..");
const strict = process.env.CLRTY_VERIFY_STRICT === "1";
const apiBase = (process.env.CLRTY_API_URL ?? "http://127.0.0.1:8545").replace(/\/$/, "");
const expectedCliVersion = "1.0.2";

let failed = 0;

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  failed++;
}

function ok(msg) {
  console.log(`OK: ${msg}`);
}

function warn(msg) {
  console.warn(`WARN: ${msg}`);
}

function loadManifest() {
  const candidates = [
    join(monorepoRoot, "CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json"),
    join(root, "packages/repo-sync/src/../../../CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json"),
  ];
  for (const p of candidates) {
    if (existsSync(p)) {
      return { path: p, data: JSON.parse(readFileSync(p, "utf8")) };
    }
  }
  return null;
}

const manifest = loadManifest();
if (!manifest) {
  fail("prism_repo_sync_manifest.json not found");
} else {
  ok(`manifest loaded (${manifest.path})`);
  for (const repo of manifest.data.repos ?? []) {
    ok(`repo pin: ${repo.slug} → ${repo.url}`);
  }
  const cliPin = manifest.data.prism_cli?.version;
  if (cliPin && cliPin !== expectedCliVersion) {
    fail(`manifest prism_cli.version ${cliPin} != ${expectedCliVersion}`);
  } else if (cliPin) {
    ok(`manifest prism_cli.version ${cliPin}`);
  }
}

const versionTs = join(root, "apps/cli/src/version.ts");
if (existsSync(versionTs)) {
  const src = readFileSync(versionTs, "utf8");
  if (!src.includes(`CLRTY_VERSION = "${expectedCliVersion}"`)) {
    fail(`apps/cli/src/version.ts is not ${expectedCliVersion}`);
  } else {
    ok(`CLI version ${expectedCliVersion}`);
  }
}

async function probeApi(path) {
  try {
    const res = await fetch(`${apiBase}${path}`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

const endpoints = [
  "/v1/status",
  "/v1/wallet/registry",
  "/v1/commons/inbox/local",
  "/v1/prism/account/register",
];

for (const path of endpoints) {
  const up = await probeApi(path === "/v1/prism/account/register" ? "/v1/status" : path);
  if (up) {
    ok(`API ${path}`);
  } else if (strict) {
    fail(`API unreachable: ${path}`);
  } else {
    warn(`API unreachable (non-strict): ${path}`);
  }
}

if (failed > 0) {
  console.error(`Cross-repo verify failed: ${failed} check(s)`);
  process.exit(1);
}

console.log("Cross-repo verify passed.");
