import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

export type TierInterest = "seed" | "strategic" | "hardware-node";

export type PartnerStatus = "none" | "pending" | "approved" | "review";
export type AccessTier = "blocked" | "account" | "entitled";

export interface AccountProfile {
  username: string;
  entity: string;
  email: string;
  cage?: string;
  wallet?: string;
  intent: string;
  tierInterest?: TierInterest;
  correlationId: string;
  createdAt: string;
  investorStep: number;
  partnerStatus?: PartnerStatus;
  packVerified?: boolean;
  investorClass?: string | null;
  accessTier?: AccessTier;
}

export interface EntitlementsFile {
  mastermind?: boolean;
  verifiedAt?: string;
  packId?: string;
  sha256?: string;
}

export interface SessionToken {
  token?: string;
  deviceCode?: string;
  expiresAt?: string;
  method: "pkce" | "device-code" | "none";
}

const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

const BASE = join(homedir(), ".clrt", "prism");

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const username = raw.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: "username must be 3-32 chars: lowercase letters, digits, _ or -" };
  }
  return { ok: true, username };
}

export function usernameNamespace(username: string): string {
  return `clrty://@${username}`;
}

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
  username: string;
  entity: string;
  email: string;
  intent: string;
  cage?: string;
  wallet?: string;
  tierInterest?: TierInterest;
}): AccountProfile {
  const validated = validateUsername(input.username);
  if (!validated.ok) throw new Error(validated.error);

  const profile: AccountProfile = {
    ...input,
    username: validated.username,
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

export function linkWallet(address: string): AccountProfile {
  const profile = loadProfile();
  if (!profile) throw new Error("no profile — run clrt account create first");
  profile.wallet = address.trim();
  saveProfile(profile);
  return profile;
}

export function updateInvestorStep(step: number): AccountProfile {
  const profile = loadProfile();
  if (!profile) throw new Error("no profile");
  profile.investorStep = step;
  saveProfile(profile);
  return profile;
}

export function getEntitlementsPath(): string {
  return join(BASE, "entitlements.json");
}

export function loadEntitlements(): EntitlementsFile {
  const p = getEntitlementsPath();
  if (!existsSync(p)) return {};
  return JSON.parse(readFileSync(p, "utf8")) as EntitlementsFile;
}

export function saveEntitlements(data: EntitlementsFile): void {
  ensureDir();
  writeFileSync(getEntitlementsPath(), JSON.stringify(data, null, 2));
}

export function setMastermindVerified(sha256?: string): EntitlementsFile {
  const data: EntitlementsFile = {
    mastermind: true,
    packId: "mastermind",
    verifiedAt: new Date().toISOString(),
    sha256,
  };
  saveEntitlements(data);
  const profile = loadProfile();
  if (profile) {
    profile.packVerified = true;
    saveProfile(profile);
  }
  return data;
}
