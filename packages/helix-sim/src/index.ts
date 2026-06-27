import { HelixClient, type SwapRequest } from "@clrt/helix-core";
import { scanLiquidity } from "@clrt/helix-routing";

export interface SimComparison {
  paths: { name: string; slippage_pct: number; risk_score: number }[];
  recommended: string;
  outcome_prediction: string;
}

export function comparePaths(req: SwapRequest): SimComparison {
  const pair = `${req.from}/${req.to}`;
  const liq = scanLiquidity(pair);
  const client = new HelixClient();
  const sim = client.simulateSwap(req);
  return {
    paths: liq.venues.map((v) => ({
      name: v.name,
      slippage_pct: v.slippage_bps / 100,
      risk_score: Math.min(0.9, v.slippage_bps / 50),
    })),
    recommended: sim.routes[0] ?? liq.best_route,
    outcome_prediction: `Expected slippage ${sim.slippage_pct}% with ${sim.savings_pct}% savings`,
  };
}
