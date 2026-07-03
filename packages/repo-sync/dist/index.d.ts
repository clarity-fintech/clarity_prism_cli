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
export declare function loadManifest(monorepoPath?: string): RepoSyncManifest;
export declare function listRepos(monorepoPath?: string): RepoPin[];
export interface DriftEntry {
    slug: string;
    expectedRef: string;
    actualRef?: string;
    status: "ok" | "unknown" | "drift";
}
export declare function getDrift(monorepoPath?: string): DriftEntry[];
export interface SyncResult {
    synced: string[];
    skipped: string[];
    manifest: RepoSyncManifest;
}
export declare function syncRepos(opts?: {
    dryRun?: boolean;
    monorepoPath?: string;
}): SyncResult;
//# sourceMappingURL=index.d.ts.map