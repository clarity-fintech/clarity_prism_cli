import {
  loadBrowserProfile,
  saveBrowserProfile,
  loadBrowserEntitlements,
  saveBrowserEntitlements,
  type BrowserAccountProfile,
} from "./prism-bridge";

export type AccessState =
  | "loading"
  | "blocked"
  | "account_created"
  | "entitled"
  | "admin"
  | "public_launch";

export interface EntitlementSnapshot {
  investor: boolean;
  mastermindPack: boolean;
  partnerApproved: boolean;
  investorClass: string | null;
  partnerStatus: string;
  packVerified: boolean;
}

export interface AccessResolution {
  state: AccessState;
  profile: BrowserAccountProfile | null;
  entitlements: EntitlementSnapshot;
  reason?: string;
}

const ADMIN_UNLOCK_KEY = "prism-admin-unlocked";
const PUBLIC_LAUNCH_KEY = "prism-terminal-public-launch";

const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;

export function validateUsername(raw: string): { ok: true; username: string } | { ok: false; error: string } {
  const username = raw.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) {
    return { ok: false, error: "username must be 3-32 chars: lowercase letters, digits, _ or -" };
  }
  return { ok: true, username };
}

function isPublicLaunch(): boolean {
  if (import.meta.env.VITE_PRISM_TERMINAL_PUBLIC === "1") return true;
  try {
    return localStorage.getItem(PUBLIC_LAUNCH_KEY) === "1";
  } catch {
    return false;
  }
}

export function isAdminUnlocked(): boolean {
  try {
    return localStorage.getItem(ADMIN_UNLOCK_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockAdmin(password: string): boolean {
  const expected = import.meta.env.VITE_CLRTY_PRISM_ADMIN_PASS as string | undefined;
  if (!expected || password !== expected) return false;
  localStorage.setItem(ADMIN_UNLOCK_KEY, "1");
  return true;
}

export function clearAdminUnlock(): void {
  localStorage.removeItem(ADMIN_UNLOCK_KEY);
}

async function apiFetch(path: string): Promise<Record<string, unknown> | null> {
  const settingsRaw = localStorage.getItem("prism-cli-settings");
  let base = "http://127.0.0.1:8545";
  let apiKey = "";
  if (settingsRaw) {
    try {
      const parsed = JSON.parse(settingsRaw) as { apiUrl?: string; apiKey?: string };
      if (parsed.apiUrl) base = parsed.apiUrl.replace(/\/$/, "");
      apiKey = parsed.apiKey ?? "";
    } catch {
      /* ignore */
    }
  }
  try {
    const headers: Record<string, string> = {};
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
    const res = await fetch(`${base}${path}`, { headers });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readEntitlementsFromRemote(remote: Record<string, unknown> | null): EntitlementSnapshot {
  const ent = (remote?.entitlements as Record<string, unknown> | undefined) ?? {};
  const partnerStatus = String(remote?.partner_status ?? ent.partner ?? "none");
  const packVerified = Boolean(remote?.pack_verified ?? ent.mastermind_pack);
  const investorClass = (remote?.investor_class as string | null) ?? null;
  const investor = Boolean(ent.investor ?? investorClass);

  const localEnt = loadBrowserEntitlements();
  const mastermindLocal = Boolean(localEnt.mastermind);

  return {
    investor,
    mastermindPack: packVerified || mastermindLocal,
    partnerApproved: partnerStatus === "approved",
    investorClass,
    partnerStatus,
    packVerified: packVerified || mastermindLocal,
  };
}

function hasEntitlement(ent: EntitlementSnapshot): boolean {
  return ent.investor || ent.mastermindPack || ent.partnerApproved;
}

export async function resolveAccessState(): Promise<AccessResolution> {
  if (isPublicLaunch()) {
    return {
      state: "public_launch",
      profile: loadBrowserProfile(),
      entitlements: readEntitlementsFromRemote(null),
      reason: "public_launch",
    };
  }

  if (isAdminUnlocked()) {
    return {
      state: "admin",
      profile: loadBrowserProfile(),
      entitlements: readEntitlementsFromRemote(null),
      reason: "admin_unlock",
    };
  }

  const profile = loadBrowserProfile();
  if (!profile) {
    return {
      state: "blocked",
      profile: null,
      entitlements: readEntitlementsFromRemote(null),
      reason: "no_account",
    };
  }

  const qs = `?username=${encodeURIComponent(profile.username)}`;
  const [accountRemote, partnerRemote] = await Promise.all([
    apiFetch(`/v1/account/status${qs}`),
    profile.correlationId
      ? apiFetch(`/v1/partner/status?correlation_id=${encodeURIComponent(profile.correlationId)}`)
      : Promise.resolve(null),
  ]);

  const entitlements = readEntitlementsFromRemote(accountRemote);
  if (partnerRemote?.status === "approved") {
    entitlements.partnerApproved = true;
    entitlements.partnerStatus = "approved";
  }

  if (profile.packVerified) entitlements.mastermindPack = true;

  if (hasEntitlement(entitlements)) {
    profile.accessTier = "entitled";
    saveBrowserProfile(profile);
    return { state: "entitled", profile, entitlements, reason: "entitlement_matched" };
  }

  profile.accessTier = "account";
  saveBrowserProfile(profile);
  return { state: "account_created", profile, entitlements, reason: "awaiting_entitlement" };
}

export function markMastermindVerifiedInBrowser(sha256?: string): void {
  saveBrowserEntitlements({
    mastermind: true,
    packId: "mastermind",
    verifiedAt: new Date().toISOString(),
    sha256,
  });
  const profile = loadBrowserProfile();
  if (profile) {
    profile.packVerified = true;
    profile.accessTier = "entitled";
    saveBrowserProfile(profile);
  }
}
