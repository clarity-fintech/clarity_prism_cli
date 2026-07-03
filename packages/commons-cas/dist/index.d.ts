export interface CommonsAsset {
    cid: string;
    path: string;
    size: number;
    topic?: string;
    createdAt: string;
}
export interface CommonsPeer {
    id: string;
    address: string;
    topics: string[];
    lastSeen: string;
}
export interface OutboxEntry {
    id: string;
    toUsername: string;
    cid: string;
    fromUsername: string;
    createdAt: string;
    status: "queued" | "sent" | "failed";
}
export interface InboxTransfer {
    id: string;
    from_username: string;
    to_username: string;
    cid: string;
    status: string;
    created_at: string;
}
export declare class CommonsStore {
    getBasePath(): string;
    put(filePath: string, topic?: string): CommonsAsset;
    get(cid: string): CommonsAsset | null;
    discover(topic: string): CommonsAsset[];
    peers(): CommonsPeer[];
    queueSend(fromUsername: string, toUsername: string, cid: string): OutboxEntry;
    markOutboxSent(id: string): void;
    listOutbox(): OutboxEntry[];
}
export declare const defaultCommonsStore: CommonsStore;
export declare function generateStubPeer(): CommonsPeer;
export type CommonsApiClient = {
    postTransfer: (body: {
        from_username: string;
        to_username: string;
        cid: string;
        meta?: Record<string, unknown>;
    }) => Promise<{
        transfer?: {
            id: string;
        };
    } | null>;
    getInbox: (username: string) => Promise<{
        transfers?: InboxTransfer[];
    } | null>;
    postReceive: (body: {
        transfer_id: string;
        username: string;
    }) => Promise<unknown>;
};
export declare function sendToUser(store: CommonsStore, api: CommonsApiClient, fromUsername: string, toUsername: string, filePath: string): Promise<{
    asset: CommonsAsset;
    transferId?: string;
    queued?: OutboxEntry;
}>;
export { CACHE_MAX_BYTES, getCacheStatus, listCache, listLibrary, putFileToCache, pasteToCache, getCacheEntry, readCacheContent, promoteToLibrary, getCommonsRoots, type CacheEntry, type LibraryEntry, type CacheStatus, } from "./file-cache.js";
export { computeTransferTax, logBlockchainTransfer, readTransferLedger, getLedgerPath, type TaxBreakdown, type BlockchainTransferLog, } from "./transfer-ledger.js";
//# sourceMappingURL=index.d.ts.map