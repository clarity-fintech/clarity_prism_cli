import {
  createHash,
  randomUUID,
} from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  copyFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

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

const BASE = join(homedir(), ".clrt", "prism", "commons");

function ensureDir(): void {
  mkdirSync(BASE, { recursive: true });
}

function cidPath(cid: string): string {
  return join(BASE, cid);
}

function indexPath(): string {
  return join(BASE, "index.json");
}

function outboxPath(): string {
  return join(BASE, "outbox.json");
}

function loadIndex(): CommonsAsset[] {
  const p = indexPath();
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as CommonsAsset[];
}

function saveIndex(assets: CommonsAsset[]): void {
  ensureDir();
  writeFileSync(indexPath(), JSON.stringify(assets, null, 2));
}

function loadOutbox(): OutboxEntry[] {
  const p = outboxPath();
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as OutboxEntry[];
}

function saveOutbox(entries: OutboxEntry[]): void {
  ensureDir();
  writeFileSync(outboxPath(), JSON.stringify(entries, null, 2));
}

export class CommonsStore {
  getBasePath(): string {
    return BASE;
  }

  put(filePath: string, topic?: string): CommonsAsset {
    ensureDir();
    const data = readFileSync(filePath);
    const cid = createHash("sha256").update(data).digest("hex");
    const dest = cidPath(cid);
    if (!existsSync(dest)) {
      copyFileSync(filePath, dest);
    }
    const asset: CommonsAsset = {
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

  get(cid: string): CommonsAsset | null {
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

  discover(topic: string): CommonsAsset[] {
    const q = topic.toLowerCase();
    return loadIndex().filter(
      (a) => a.topic?.toLowerCase().includes(q) || a.cid.startsWith(q)
    );
  }

  peers(): CommonsPeer[] {
    return [
      {
        id: "local-stub",
        address: "127.0.0.1:7700",
        topics: ["primitives", "research"],
        lastSeen: new Date().toISOString(),
      },
    ];
  }

  queueSend(fromUsername: string, toUsername: string, cid: string): OutboxEntry {
    const entry: OutboxEntry = {
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

  markOutboxSent(id: string): void {
    const outbox = loadOutbox().map((e) =>
      e.id === id ? { ...e, status: "sent" as const } : e
    );
    saveOutbox(outbox);
  }

  listOutbox(): OutboxEntry[] {
    return loadOutbox();
  }
}

export const defaultCommonsStore = new CommonsStore();

export function generateStubPeer(): CommonsPeer {
  return {
    id: randomUUID(),
    address: "127.0.0.1:7700",
    topics: [],
    lastSeen: new Date().toISOString(),
  };
}

export type CommonsApiClient = {
  postTransfer: (body: {
    from_username: string;
    to_username: string;
    cid: string;
    meta?: Record<string, unknown>;
  }) => Promise<{ transfer?: { id: string } } | null>;
  getInbox: (username: string) => Promise<{ transfers?: InboxTransfer[] } | null>;
  postReceive: (body: { transfer_id: string; username: string }) => Promise<unknown>;
};

export async function sendToUser(
  store: CommonsStore,
  api: CommonsApiClient,
  fromUsername: string,
  toUsername: string,
  filePath: string
): Promise<{ asset: CommonsAsset; transferId?: string; queued?: OutboxEntry }> {
  const asset = store.put(filePath, `p2p:${toUsername}`);
  const result = await api.postTransfer({
    from_username: fromUsername,
    to_username: toUsername,
    cid: asset.cid,
    meta: { size: asset.size },
  });
  if (result?.transfer?.id) {
    return { asset, transferId: result.transfer.id };
  }
  const queued = store.queueSend(fromUsername, toUsername, asset.cid);
  return { asset, queued };
}
