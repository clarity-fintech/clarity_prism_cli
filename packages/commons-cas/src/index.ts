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

function loadIndex(): CommonsAsset[] {
  const p = indexPath();
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as CommonsAsset[];
}

function saveIndex(assets: CommonsAsset[]): void {
  ensureDir();
  writeFileSync(indexPath(), JSON.stringify(assets, null, 2));
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
