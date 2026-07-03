import { createHash, randomUUID, } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync, } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
const BASE = join(homedir(), ".clrt", "prism", "commons");
function ensureDir() {
    mkdirSync(BASE, { recursive: true });
}
function cidPath(cid) {
    return join(BASE, cid);
}
function indexPath() {
    return join(BASE, "index.json");
}
function outboxPath() {
    return join(BASE, "outbox.json");
}
function loadIndex() {
    const p = indexPath();
    if (!existsSync(p))
        return [];
    return JSON.parse(readFileSync(p, "utf8"));
}
function saveIndex(assets) {
    ensureDir();
    writeFileSync(indexPath(), JSON.stringify(assets, null, 2));
}
function loadOutbox() {
    const p = outboxPath();
    if (!existsSync(p))
        return [];
    return JSON.parse(readFileSync(p, "utf8"));
}
function saveOutbox(entries) {
    ensureDir();
    writeFileSync(outboxPath(), JSON.stringify(entries, null, 2));
}
export class CommonsStore {
    getBasePath() {
        return BASE;
    }
    put(filePath, topic) {
        ensureDir();
        const data = readFileSync(filePath);
        const cid = createHash("sha256").update(data).digest("hex");
        const dest = cidPath(cid);
        if (!existsSync(dest)) {
            copyFileSync(filePath, dest);
        }
        const asset = {
            cid,
            path: dest,
            size: data.length,
            topic,
            createdAt: new Date().toISOString(),
        };
        const index = loadIndex().filter((a) => a.cid !== cid);
        index.push(asset);
        saveIndex(index);
        return asset;
    }
    get(cid) {
        const dest = cidPath(cid);
        if (!existsSync(dest)) {
            const found = loadIndex().find((a) => a.cid === cid);
            return found ?? null;
        }
        const stat = readFileSync(dest);
        return {
            cid,
            path: dest,
            size: stat.length,
            createdAt: new Date().toISOString(),
        };
    }
    discover(topic) {
        const q = topic.toLowerCase();
        return loadIndex().filter((a) => a.topic?.toLowerCase().includes(q) || a.cid.startsWith(q));
    }
    peers() {
        return [
            {
                id: "local-stub",
                address: "127.0.0.1:7700",
                topics: ["primitives", "research"],
                lastSeen: new Date().toISOString(),
            },
        ];
    }
    queueSend(fromUsername, toUsername, cid) {
        const entry = {
            id: randomUUID(),
            fromUsername,
            toUsername: toUsername.trim().toLowerCase(),
            cid,
            createdAt: new Date().toISOString(),
            status: "queued",
        };
        const outbox = loadOutbox();
        outbox.push(entry);
        saveOutbox(outbox);
        return entry;
    }
    markOutboxSent(id) {
        const outbox = loadOutbox().map((e) => e.id === id ? { ...e, status: "sent" } : e);
        saveOutbox(outbox);
    }
    listOutbox() {
        return loadOutbox();
    }
}
export const defaultCommonsStore = new CommonsStore();
export function generateStubPeer() {
    return {
        id: randomUUID(),
        address: "127.0.0.1:7700",
        topics: [],
        lastSeen: new Date().toISOString(),
    };
}
export async function sendToUser(store, api, fromUsername, toUsername, filePath) {
    const asset = store.put(filePath, `p2p:${toUsername}`);
    const result = await api.postTransfer({
        from_username: fromUsername,
        to_username: toUsername,
        cid: asset.cid,
        meta: { size: asset.size, filename: filePath.split("/").pop() },
    });
    if (result?.transfer?.id) {
        return { asset, transferId: result.transfer.id };
    }
    const queued = store.queueSend(fromUsername, toUsername, asset.cid);
    return { asset, queued };
}
export { CACHE_MAX_BYTES, getCacheStatus, listCache, listLibrary, putFileToCache, pasteToCache, getCacheEntry, readCacheContent, promoteToLibrary, getCommonsRoots, } from "./file-cache.js";
export { computeTransferTax, logBlockchainTransfer, readTransferLedger, getLedgerPath, } from "./transfer-ledger.js";
//# sourceMappingURL=index.js.map