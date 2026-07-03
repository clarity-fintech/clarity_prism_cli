export interface SecureQueryWrap<T> {
    payload: T;
    obfuscated_intent: string;
    enclave_lane: string;
    mev_shield: boolean;
}
export declare function wrapPrivateQuery<T extends Record<string, unknown>>(payload: T): SecureQueryWrap<T>;
export declare function strategyObfuscation(strategy: string): string;
//# sourceMappingURL=index.d.ts.map