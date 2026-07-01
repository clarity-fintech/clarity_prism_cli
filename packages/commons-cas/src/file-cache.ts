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
  readdirSync,
  statSync,
  unlinkSync,
} from "node:fs";
import { homedir } from "node:os";
import { join, basename } from "node:path";

export const CACHE_MAX_BYTES = 1_073_741_824; // 1 GiB

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

const COMMONS_ROOT = join(homedir(), ".clrt", "prism", "commons");

function cacheRoot(username: string): string {
  return join(COMMONS_ROOT, "cache", username.trim().toLowerCase());
}

function libraryRoot(): string {
  return join(COMMONS_ROOT, "library");
}

function cacheIndexPath(username: string): string {
  return join(cacheRoot(username), "index.json");
}

function libraryIndexPath(): string {
  return join(libraryRoot(), "index.json");
}

function ensureDir(path: string): void {
  mkdirSync(path, { recursive: true });
}

function loadCacheIndex(username: string): CacheEntry[] {
  const p = cacheIndexPath(username);
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as CacheEntry[];
}

function saveCacheIndex(username: string, entries: CacheEntry[]): void {
  ensureDir(cacheRoot(username));
  writeFileSync(cacheIndexPath(username), JSON.stringify(entries, null, 2));
}

function loadLibraryIndex(): LibraryEntry[] {
  const p = libraryIndexPath();
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as LibraryEntry[];
}

function saveLibraryIndex(entries: LibraryEntry[]): void {
  ensureDir(libraryRoot());
  writeFileSync(libraryIndexPath(), JSON.stringify(entries, null, 2));
}

function cidForBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function cacheUsedBytes(username: string): number {
  return loadCacheIndex(username).reduce((sum, e) => sum + e.size, 0);
}

function evictLru(username: string, neededBytes: number): void {
  let entries = loadCacheIndex(username);
  entries.sort((a, b) => a.lastAccessedAt.localeCompare(b.lastAccessedAt));
  let used = entries.reduce((s, e) => s + e.size, 0);

  while (used + neededBytes > CACHE_MAX_BYTES && entries.length > 0) {
    const victim = entries.shift()!;
    if (existsSync(victim.path)) unlinkSync(victim.path);
    used -= victim.size;
  }
  saveCacheIndex(username, entries);
}

export function getCacheStatus(username: string): CacheStatus {
  const entries = loadCacheIndex(username);
  const usedBytes = entries.reduce((s, e) => s + e.size, 0);
  return {
    username: username.trim().toLowerCase(),
    usedBytes,
    maxBytes: CACHE_MAX_BYTES,
    percentUsed: Math.round((usedBytes / CACHE_MAX_BYTES) * 10000) / 100,
    entryCount: entries.length,
  };
}

export function listCache(username: string): CacheEntry[] {
  return loadCacheIndex(username).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listLibrary(): LibraryEntry[] {
  return loadLibraryIndex().sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export function putFileToCache(
  username: string,
  filePath: string,
  name?: string
): CacheEntry {
  const user = username.trim().toLowerCase();
  const data = readFileSync(filePath);
  return putBufferToCache(user, data, name ?? basename(filePath), "upload");
}

export function pasteToCache(username: string, text: string, name?: string): CacheEntry {
  const user = username.trim().toLowerCase();
  const buf = Buffer.from(text, "utf8");
  return putBufferToCache(user, buf, name ?? `paste-${Date.now()}.txt`, "paste");
}

function putBufferToCache(
  username: string,
  data: Buffer,
  name: string,
  source: CacheEntry["source"]
): CacheEntry {
  if (data.length > CACHE_MAX_BYTES) {
    throw new Error(`file exceeds 1GB cache limit (${data.length} bytes)`);
  }

  evictLru(username, data.length);
  if (cacheUsedBytes(username) + data.length > CACHE_MAX_BYTES) {
    throw new Error("cache full — remove files or promote to library");
  }

  const cid = cidForBuffer(data);
  const dir = cacheRoot(username);
  ensureDir(dir);
  const dest = join(dir, cid);
  if (!existsSync(dest)) writeFileSync(dest, data);

  const now = new Date().toISOString();
  const entry: CacheEntry = {
    id: randomUUID(),
    cid,
    name,
    size: data.length,
    username,
    path: dest,
    createdAt: now,
    lastAccessedAt: now,
    source,
  };

  const index = loadCacheIndex(username).filter((e) => e.cid !== cid);
  index.push(entry);
  saveCacheIndex(username, index);
  return entry;
}

export function getCacheEntry(username: string, cid: string): CacheEntry | null {
  const entries = loadCacheIndex(username);
  const found = entries.find((e) => e.cid === cid || e.id === cid);
  if (!found) return null;
  found.lastAccessedAt = new Date().toISOString();
  saveCacheIndex(username, entries);
  return found;
}

export function readCacheContent(username: string, cid: string): Buffer | null {
  const entry = getCacheEntry(username, cid);
  if (!entry || !existsSync(entry.path)) return null;
  return readFileSync(entry.path);
}

export function promoteToLibrary(
  username: string,
  cid: string,
  transferId?: string
): LibraryEntry {
  const entry = getCacheEntry(username, cid);
  if (!entry) throw new Error("cache entry not found");

  const libDir = libraryRoot();
  ensureDir(libDir);
  const libPath = join(libDir, entry.cid);
  if (!existsSync(libPath)) copyFileSync(entry.path, libPath);

  const libEntry: LibraryEntry = {
    id: randomUUID(),
    cid: entry.cid,
    name: entry.name,
    size: entry.size,
    ownerUsername: username.trim().toLowerCase(),
    path: libPath,
    addedAt: new Date().toISOString(),
    transferId,
  };

  const lib = loadLibraryIndex().filter((e) => e.cid !== entry.cid);
  lib.push(libEntry);
  saveLibraryIndex(lib);
  return libEntry;
}

export function getCommonsRoots(): { cache: string; library: string } {
  return { cache: join(COMMONS_ROOT, "cache"), library: libraryRoot() };
}
