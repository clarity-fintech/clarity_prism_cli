export declare const EXCHANGES: readonly ["binance", "coinbase", "kraken"];
export type ExchangeSlug = (typeof EXCHANGES)[number];
export interface TokenBucket {
    rps: number;
    burst: number;
    take(): boolean;
    reset(): void;
}
export declare function createTokenBucket(rps: number, burst: number): TokenBucket;
export declare function createRateLimiter(env?: NodeJS.ProcessEnv): Record<ExchangeSlug, TokenBucket>;
export declare const defaultRateLimiters: Record<"binance" | "coinbase" | "kraken", TokenBucket>;
//# sourceMappingURL=rate-limit.d.ts.map