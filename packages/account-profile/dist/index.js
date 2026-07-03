import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
const USERNAME_RE = /^[a-z0-9_-]{3,32}$/;
const BASE = join(homedir(), ".clrt", "prism");
export function validateUsername(raw) {
    const username = raw.trim().toLowerCase();
    if (!USERNAME_RE.test(username)) {
        return { ok: false, error: "username must be 3-32 chars: lowercase letters, digits, _ or -" };
    }
    return { ok: true, username };
}
export function usernameNamespace(username) {
    return `clrty://@${username}`;
}
export function getProfilePath() {
    return join(BASE, "account.json");
}
export function getSessionPath() {
    return join(BASE, "session.json");
}
function ensureDir() {
    mkdirSync(BASE, { recursive: true });
}
export function loadProfile() {
    const p = getProfilePath();
    if (!existsSync(p))
        return null;
    return JSON.parse(readFileSync(p, "utf8"));
}
export function saveProfile(profile) {
    ensureDir();
    writeFileSync(getProfilePath(), JSON.stringify(profile, null, 2));
}
export function createProfile(input) {
    const validated = validateUsername(input.username);
    if (!validated.ok)
        throw new Error(validated.error);
    const profile = {
        ...input,
        username: validated.username,
        correlationId: randomUUID(),
        createdAt: new Date().toISOString(),
        investorStep: 1,
    };
    saveProfile(profile);
    return profile;
}
export function loadSession() {
    const p = getSessionPath();
    if (!existsSync(p))
        return { method: "none" };
    return JSON.parse(readFileSync(p, "utf8"));
}
export function saveSession(session) {
    ensureDir();
    writeFileSync(getSessionPath(), JSON.stringify(session, null, 2));
}
export function maskEmail(email) {
    const [user, domain] = email.split("@");
    if (!domain)
        return "***";
    return `${user.slice(0, 2)}***@${domain}`;
}
export function linkWallet(address) {
    const profile = loadProfile();
    if (!profile)
        throw new Error("no profile — run clrt account create first");
    profile.wallet = address.trim();
    saveProfile(profile);
    return profile;
}
export function updateInvestorStep(step) {
    const profile = loadProfile();
    if (!profile)
        throw new Error("no profile");
    profile.investorStep = step;
    saveProfile(profile);
    return profile;
}
export function getEntitlementsPath() {
    return join(BASE, "entitlements.json");
}
export function loadEntitlements() {
    const p = getEntitlementsPath();
    if (!existsSync(p))
        return {};
    return JSON.parse(readFileSync(p, "utf8"));
}
export function saveEntitlements(data) {
    ensureDir();
    writeFileSync(getEntitlementsPath(), JSON.stringify(data, null, 2));
}
export function setMastermindVerified(sha256) {
    const data = {
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
//# sourceMappingURL=index.js.map