export const EXCHANGES = ["binance", "coinbase", "kraken"] as const;
export type ExchangeSlug = (typeof EXCHANGES)[number];

export interface TokenBucket {
  rps: number;
  burst: number;
  take(): boolean;
  reset(): void;
}

export function createTokenBucket(rps: number, burst: number): TokenBucket {
  let tokens = burst;
  let lastRefill = Date.now();

  function refill(): void {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;
    tokens = Math.min(burst, tokens + elapsed * rps);
    lastRefill = now;
  }

  return {
    rps,
    burst,
    take(): boolean {
      refill();
      if (tokens >= 1) {
        tokens -= 1;
        return true;
      }
      return false;
    },
    reset(): void {
      tokens = burst;
      lastRefill = Date.now();
    },
  };
}

export function createRateLimiter(
  env: NodeJS.ProcessEnv = process.env
): Record<ExchangeSlug, TokenBucket> {
  const rps = Number(env.EXCHANGE_RATE_LIMIT_RPS ?? "10");
  const burst = Number(env.EXCHANGE_RATE_LIMIT_BURST ?? "20");
  const limiters = {} as Record<ExchangeSlug, TokenBucket>;
  for (const ex of EXCHANGES) {
    limiters[ex] = createTokenBucket(rps, burst);
  }
  return limiters;
}

export const defaultRateLimiters = createRateLimiter();
