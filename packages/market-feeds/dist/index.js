export { EXCHANGES, createTokenBucket, createRateLimiter, defaultRateLimiters, } from "./rate-limit.js";
export function normalizeFeedSample(exchange, raw) {
    return {
        exchange,
        symbol: String(raw.symbol ?? "BTC/USDT"),
        price: Number(raw.price ?? raw.last ?? 0),
        timestamp: new Date().toISOString(),
        source: "stub",
    };
}
//# sourceMappingURL=index.js.map