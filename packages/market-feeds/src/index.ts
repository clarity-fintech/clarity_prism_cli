export {
  EXCHANGES,
  createTokenBucket,
  createRateLimiter,
  defaultRateLimiters,
  type ExchangeSlug,
  type TokenBucket,
} from "./rate-limit.js";

export interface MarketEvent {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
  source: "live" | "dry-run" | "stub";
}

export function normalizeFeedSample(
  exchange: string,
  raw: Record<string, unknown>
): MarketEvent {
  return {
    exchange,
    symbol: String(raw.symbol ?? "BTC/USDT"),
    price: Number(raw.price ?? raw.last ?? 0),
    timestamp: new Date().toISOString(),
    source: "stub",
  };
}
