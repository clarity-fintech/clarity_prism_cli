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
export declare function validateUsername(raw: string): {
    ok: true;
    username: string;
} | {
    ok: false;
    error: string;
};
export declare function usernameNamespace(username: string): string;
export declare function getProfilePath(): string;
export declare function getSessionPath(): string;
export declare function loadProfile(): AccountProfile | null;
export declare function saveProfile(profile: AccountProfile): void;
export declare function createProfile(input: {
    username: string;
    entity: string;
    email: string;
    intent: string;
    cage?: string;
    wallet?: string;
    tierInterest?: TierInterest;
}): AccountProfile;
export declare function loadSession(): SessionToken;
export declare function saveSession(session: SessionToken): void;
export declare function maskEmail(email: string): string;
export declare function linkWallet(address: string): AccountProfile;
export declare function updateInvestorStep(step: number): AccountProfile;
export declare function getEntitlementsPath(): string;
export declare function loadEntitlements(): EntitlementsFile;
export declare function saveEntitlements(data: EntitlementsFile): void;
export declare function setMastermindVerified(sha256?: string): EntitlementsFile;
//# sourceMappingURL=index.d.ts.map