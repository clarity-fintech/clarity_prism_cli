export declare const CACHE_MAX_BYTES = 1073741824;
export interface CacheEntry {
    id: string;
    cid: string;
    name: string;
    size: number;
    username: string;
    path: string;
    createdAt: string;
    lastAccessedAt: string;
    source: "upload" | "paste" | "receive";
}
export interface LibraryEntry {
    id: string;
    cid: string;
    name: string;
    size: number;
    ownerUsername: string;
    path: string;
    addedAt: string;
    transferId?: string;
}
export interface CacheStatus {
    username: string;
    usedBytes: number;
    maxBytes: number;
    percentUsed: number;
    entryCount: number;
}
export declare function getCacheStatus(username: string): CacheStatus;
export declare function listCache(username: string): CacheEntry[];
export declare function listLibrary(): LibraryEntry[];
export declare function putFileToCache(username: string, filePath: string, name?: string): CacheEntry;
export declare function pasteToCache(username: string, text: string, name?: string): CacheEntry;
export declare function getCacheEntry(username: string, cid: string): CacheEntry | null;
export declare function readCacheContent(username: string, cid: string): Buffer | null;
export declare function promoteToLibrary(username: string, cid: string, transferId?: string): LibraryEntry;
export declare function getCommonsRoots(): {
    cache: string;
    library: string;
};
//# sourceMappingURL=file-cache.d.ts.map