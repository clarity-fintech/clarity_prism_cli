export const EXCHANGES = ["binance", "coinbase", "kraken"];
export function createTokenBucket(rps, burst) {
    let tokens = burst;
    let lastRefill = Date.now();
    function refill() {
        const now = Date.now();
        const elapsed = (now - lastRefill) / 1000;
        tokens = Math.min(burst, tokens + elapsed * rps);
        lastRefill = now;
    }
    return {
        rps,
        burst,
        take() {
            refill();
            if (tokens >= 1) {
                tokens -= 1;
                return true;
            }
            return false;
        },
        reset() {
            tokens = burst;
            lastRefill = Date.now();
        },
    };
}
export function createRateLimiter(env = process.env) {
    const rps = Number(env.EXCHANGE_RATE_LIMIT_RPS ?? "10");
    const burst = Number(env.EXCHANGE_RATE_LIMIT_BURST ?? "20");
    const limiters = {};
    for (const ex of EXCHANGES) {
        limiters[ex] = createTokenBucket(rps, burst);
    }
    return limiters;
}
export const defaultRateLimiters = createRateLimiter();
//# sourceMappingURL=rate-limit.js.map