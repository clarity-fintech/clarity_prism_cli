import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export type TierInterest = "seed" | "strategic" | "hardware-node";

export interface AccountProfile {
  entity: string;
  email: string;
  cage?: string;
  wallet?: string;
  intent: string;
  tierInterest?: TierInterest;
  correlationId: string;
  createdAt: string;
  investorStep: number;
}

export interface SessionToken {
  token?: string;
  deviceCode?: string;
  expiresAt?: string;
  method: "pkce" | "device-code" | "none";
}

const BASE = join(homedir(), ".clrt", "prism");

export function getProfilePath(): string {
  return join(BASE, "account.json");
}

export function getSessionPath(): string {
  return join(BASE, "session.json");
}

function ensureDir(): void {
  mkdirSync(BASE, { recursive: true });
}

export function loadProfile(): AccountProfile | null {
  const p = getProfilePath();
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as AccountProfile;
}

export function saveProfile(profile: AccountProfile): void {
  ensureDir();
  writeFileSync(getProfilePath(), JSON.stringify(profile, null, 2));
}

export function createProfile(input: {
  entity: string;
  email: string;
  intent: string;
  cage?: string;
  wallet?: string;
  tierInterest?: TierInterest;
}): AccountProfile {
  const profile: AccountProfile = {
    ...input,
    correlationId: randomUUID(),
    createdAt: new Date().toISOString(),
    investorStep: 1,
  };
  saveProfile(profile);
  return profile;
}

export function loadSession(): SessionToken {
  const p = getSessionPath();
  if (!existsSync(p)) return { method: "none" };
  return JSON.parse(readFileSync(p, "utf8")) as SessionToken;
}

export function saveSession(session: SessionToken): void {
  ensureDir();
  writeFileSync(getSessionPath(), JSON.stringify(session, null, 2));
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user!.slice(0, 2)}***@${domain}`;
}
