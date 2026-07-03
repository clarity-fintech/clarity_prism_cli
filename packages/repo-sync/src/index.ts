import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export interface RepoPin {
  slug: string;
  owner: string;
  repo: string;
  ref: string;
  role: string;
  url: string;
}

export interface RepoSyncManifest {
  version: number;
  updated: string;
  prism_cli?: {
    version: string;
    micro?: number;
    repo: string;
    tag?: string;
  };
  repos: RepoPin[];
}

const DEFAULT_MANIFEST: RepoSyncManifest = {
  version: 1,
  updated: "2026-06-18",
  prism_cli: {
    version: "1.0.2",
    micro: 1,
    repo: "clarity-fintech/clarity_prism_cli",
    tag: "v1.0.2",
  },
  repos: [
    {
      slug: "clarity-prism-cli",
      owner: "williamsnameiswill",
      repo: "clarity-prism-cli",
      ref: "main",
      role: "company-cli",
      url: "https://github.com/clarity-fintech/clarity_prism_cli",
    },
    {
      slug: "clrt-monorepo",
      owner: "theangelofwill",
      repo: "-CLRTY",
      ref: "main",
      role: "substrate-api",
      url: "https://github.com/theangelofwill/-CLRTY",
    },
    {
      slug: "wallet-integration",
      owner: "theangelofwill",
      repo: "CLRTY-WALLET-INTEGRATION",
      ref: "main",
      role: "wallet-sdk",
      url: "https://github.com/clarity-fintech/wallet_integration",
    },
  ],
};

function resolveManifestPath(monorepoPath?: string): string | null {
  const candidates = [
    monorepoPath
      ? join(monorepoPath, "CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json")
      : null,
    join(process.cwd(), "CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json"),
    join(process.cwd(), "../CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json"),
    join(dirname(fileURLToPath(import.meta.url)), "../../../CLRTY_SUBSTRATE/boot/prism_repo_sync_manifest.json"),
  ].filter(Boolean) as string[];

  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function loadManifest(monorepoPath?: string): RepoSyncManifest {
  const path = resolveManifestPath(monorepoPath);
  if (path) {
    return JSON.parse(readFileSync(path, "utf8")) as RepoSyncManifest;
  }
  return DEFAULT_MANIFEST;
}

export function listRepos(monorepoPath?: string): RepoPin[] {
  return loadManifest(monorepoPath).repos;
}

export interface DriftEntry {
  slug: string;
  expectedRef: string;
  actualRef?: string;
  status: "ok" | "unknown" | "drift";
}

export function getDrift(monorepoPath?: string): DriftEntry[] {
  const manifest = loadManifest(monorepoPath);
  return manifest.repos.map((r) => ({
    slug: r.slug,
    expectedRef: r.ref,
    actualRef: process.env[`CLRT_REPO_REF_${r.slug.toUpperCase().replace(/-/g, "_")}`],
    status: "unknown" as const,
  }));
}

export interface SyncResult {
  synced: string[];
  skipped: string[];
  manifest: RepoSyncManifest;
}

export function syncRepos(opts: { dryRun?: boolean; monorepoPath?: string } = {}): SyncResult {
  const manifest = loadManifest(opts.monorepoPath);
  const synced: string[] = [];
  const skipped: string[] = [];

  for (const repo of manifest.repos) {
    if (opts.dryRun) {
      skipped.push(`${repo.slug}@${repo.ref} (dry-run)`);
    } else {
      synced.push(`${repo.slug}@${repo.ref}`);
    }
  }

  return { synced, skipped, manifest };
}
