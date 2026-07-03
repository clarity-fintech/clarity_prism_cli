export { EXCHANGES, createTokenBucket, createRateLimiter, defaultRateLimiters, type ExchangeSlug, type TokenBucket, } from "./rate-limit.js";
export interface MarketEvent {
    exchange: string;
    symbol: string;
    price: number;
    timestamp: string;
    source: "live" | "dry-run" | "stub";
}
export declare function normalizeFeedSample(exchange: string, raw: Record<string, unknown>): MarketEvent;
//# sourceMappingURL=index.d.ts.map