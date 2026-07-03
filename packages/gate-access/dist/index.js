/** Public domain separator — safe to ship in client bundles. Master secret stays local. */
export const GATE_PEPPER = "clrt-prism-gate-pepper-v1";
export const GATE_DOMAIN = "clarity-prism-terminal-gate-v1";
const PBKDF2_ITERATIONS = 100_000;
const DERIVE_BITS = 128;
function normalizeGateCode(raw) {
    return raw.trim().toUpperCase().replace(/\s+/g, "");
}
export function formatGateCode(bytes) {
    const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    return [0, 4, 8, 12].map((i) => hex.slice(i, i + 4).toUpperCase()).join("-");
}
async function pbkdf2Derive(master) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(master), "PBKDF2", false, ["deriveBits"]);
    const salt = enc.encode(`${GATE_PEPPER}:${GATE_DOMAIN}`);
    const bits = await crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
    }, keyMaterial, DERIVE_BITS);
    return new Uint8Array(bits);
}
/** Derive a personal gate access code from your master secret (CLI only — never commit master). */
export async function deriveGateAccessPassword(master) {
    if (!master.trim())
        throw new Error("master secret required");
    const bytes = await pbkdf2Derive(master.trim());
    return formatGateCode(bytes);
}
/** SHA-256 digest of normalized access code — embed via VITE_CLRTY_GATE_ACCESS_DIGEST at build. */
export async function digestGateAccessPassword(code) {
    const normalized = normalizeGateCode(code);
    const enc = new TextEncoder();
    const hash = await crypto.subtle.digest("SHA-256", enc.encode(`${GATE_PEPPER}:${normalized}`));
    return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
export async function verifyGateAccessPassword(code, expectedDigest) {
    if (!expectedDigest.trim())
        return false;
    const digest = await digestGateAccessPassword(code);
    return digest === expectedDigest.trim().toLowerCase();
}
//# sourceMappingURL=index.js.map