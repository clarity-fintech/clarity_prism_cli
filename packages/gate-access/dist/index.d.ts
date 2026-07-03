/** Public domain separator — safe to ship in client bundles. Master secret stays local. */
export declare const GATE_PEPPER = "clrt-prism-gate-pepper-v1";
export declare const GATE_DOMAIN = "clarity-prism-terminal-gate-v1";
export declare function formatGateCode(bytes: Uint8Array): string;
/** Derive a personal gate access code from your master secret (CLI only — never commit master). */
export declare function deriveGateAccessPassword(master: string): Promise<string>;
/** SHA-256 digest of normalized access code — embed via VITE_CLRTY_GATE_ACCESS_DIGEST at build. */
export declare function digestGateAccessPassword(code: string): Promise<string>;
export declare function verifyGateAccessPassword(code: string, expectedDigest: string): Promise<boolean>;
//# sourceMappingURL=index.d.ts.map