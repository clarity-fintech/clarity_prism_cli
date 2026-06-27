export interface LiquidityScan {
  pair: string;
  depth_usd: number;
  venues: { name: string; depth_usd: number; slippage_bps: number }[];
  best_route: string;
}

export function scanLiquidity(pair: string): LiquidityScan {
  const [base, quote] = pair.split(/[/\-]/);
  const depth = 2_400_000 + (base?.length ?? 3) * 100_000;
  return {
    pair: `${base}/${quote}`,
    depth_usd: depth,
    venues: [
      { name: "Jupiter", depth_usd: depth * 0.45, slippage_bps: 8 },
      { name: "Orca", depth_usd: depth * 0.35, slippage_bps: 12 },
      { name: "Raydium", depth_usd: depth * 0.2, slippage_bps: 15 },
    ],
    best_route: "Jupiter → Orca split",
  };
}

export function minimizeSlippage(amount: number, depth: number): number {
  if (depth <= 0) return 1;
  return Math.min(1, (amount / depth) * 100);
}
