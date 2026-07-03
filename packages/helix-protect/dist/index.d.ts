export interface ProtectOptions {
    privateLane?: boolean;
    encryptPayload?: boolean;
    mevShield?: boolean;
}
export interface ProtectedExecution {
    lane: string;
    mev_shield: boolean;
    front_run_resistance: boolean;
    encryption: string;
}
export declare function applyProtection(opts?: ProtectOptions): ProtectedExecution;
//# sourceMappingURL=index.d.ts.map