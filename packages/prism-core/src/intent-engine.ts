export interface IntentQuery {
  intent: string;
  query?: string;
  address?: string;
  context?: Record<string, unknown>;
  private?: boolean;
  chains?: string[];
}

export interface IntentResult {
  intent: string;
  confidence: number;
  relevance_score: number;
  proof_of_relevance: boolean;
  suggested_routes: string[];
  prefetch: Record<string, unknown>;
  capital_context: Record<string, unknown>;
}

const DEFAULT_THRESHOLD = 0.55;

function relevanceScore(q: IntentQuery): number {
  const base = 0.45;
  const intentBonus = q.intent.length > 3 ? 0.15 : 0;
  const entropy =
    typeof q.context?.wallet_entropy === "number" ? q.context.wallet_entropy : 0.5;
  const spread =
    typeof q.context?.spread_bps === "number" ? q.context.spread_bps : 0;
  const spreadPenalty = Math.min(0.2, spread / 500);
  return Math.max(0, Math.min(1, base + intentBonus + entropy * 0.25 - spreadPenalty));
}

export class IntentEngine {
  interpret(q: IntentQuery): IntentResult {
    const score = relevanceScore(q);
    const por = score >= DEFAULT_THRESHOLD;
    return {
      intent: q.intent,
      confidence: Math.round(score * 1000) / 10,
      relevance_score: Math.round(score * 1000) / 1000,
      proof_of_relevance: por,
      suggested_routes: por
        ? [
            "HELIX-02:intent_resolver",
            "HELIX-06:liquidity_graph",
            "PRISM:capital_context",
          ]
        : ["AVR:compliance_gate"],
      prefetch: {
        telemetry_keys: ["helix_runtime", "nsd_confidence", "mev_deep_dive"],
        topology_threshold_ms: 50,
      },
      capital_context: {
        lane: por ? "helix_internal" : "queue_slippage_gate",
        context_tag: String(q.context?.capital ?? "default"),
        wallet_entropy: q.context?.wallet_entropy ?? 0.5,
        private: q.private ?? false,
        chains: q.chains ?? ["solana"],
      },
    };
  }
}
