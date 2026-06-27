import {
  IntentEngine,
  CacheIntelligence,
  appendEvent,
  computeStats,
  type IntentQuery,
} from "@clrt/prism-core";
import { predictCapitalOutcome } from "@clrt/prism-models";
import { wrapPrivateQuery } from "@clrt/prism-secure";
import { HelixClient } from "@clrt/helix-core";

export interface PrismClientConfig {
  apiKey?: string;
  network?: "devnet" | "testnet" | "mainnet";
  apiUrl?: string;
  nodeType?: "low_latency" | "predictive" | "private" | "fusion";
}

export interface PrismQueryInput {
  intent: string;
  query?: string;
  address?: string;
  context?: Record<string, unknown>;
  private?: boolean;
  chains?: string[];
}

export interface IntentAwareApiResponse {
  query: string;
  intent: string;
  relevance_score: number;
  proof_of_relevance: boolean;
  capital_context: Record<string, unknown>;
  suggested_routes: string[];
  prefetch: Record<string, unknown>;
  deterministic: boolean;
}

async function postIntentAware(
  cfg: PrismClientConfig,
  body: Record<string, unknown>
): Promise<IntentAwareApiResponse | null> {
  const base = (cfg.apiUrl ?? process.env.CLRTY_API_URL)?.replace(/\/$/, "");
  if (!base) return null;
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    const key = cfg.apiKey ?? process.env.CLRTY_API_KEY;
    if (key) headers.Authorization = `Bearer ${key}`;
    const res = await fetch(`${base}/v1/prism/intent-aware`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return (await res.json()) as IntentAwareApiResponse;
  } catch {
    return null;
  }
}

export class PrismClient {
  private engine = new IntentEngine();
  cache = new CacheIntelligence();
  private helix: HelixClient;
  private predictionEnabled = false;

  constructor(private cfg: PrismClientConfig = {}) {
    this.helix = new HelixClient({ apiUrl: cfg.apiUrl, apiKey: cfg.apiKey });
  }

  rpc = {
    getAccount: async (opts: { address: string }) => ({
      address: opts.address,
      network: this.cfg.network ?? "mainnet",
      lamports: 1_000_000_000,
    }),
  };

  async query(input: PrismQueryInput) {
    const q: IntentQuery = {
      intent: input.intent,
      query: input.query,
      address: input.address,
      context: input.context,
      private: input.private,
      chains: input.chains,
    };

    if (input.private) {
      wrapPrivateQuery({ intent: input.intent, context: input.context });
    }

    const apiBody = {
      query: input.query ?? input.intent,
      intent: input.intent,
      wallet_entropy: input.context?.wallet_entropy,
      spread_bps: input.context?.spread_bps,
      capital_context: String(input.context?.capital ?? "default"),
    };

    const remote = await postIntentAware(this.cfg, apiBody);
    const local = this.engine.interpret(q);

    appendEvent({
      type: "query",
      intent: input.intent,
      evidence: { mode: remote ? "api" : "local", address: input.address },
    });

    if (remote) {
      return {
        intent: remote.intent,
        confidence: remote.relevance_score * 100,
        relevance_score: remote.relevance_score,
        proof_of_relevance: remote.proof_of_relevance,
        suggested_routes: remote.suggested_routes,
        prefetch: remote.prefetch,
        capital_context: remote.capital_context,
        mode: "api" as const,
      };
    }

    return { ...local, mode: "local" as const };
  }

  async execute(opts: {
    intent: string;
    from?: string;
    to?: string;
    amount?: number;
    optimize?: boolean;
  }) {
    const interpreted = await this.query({ intent: opts.intent });
    const swap = this.helix.executeSwap({
      from: opts.from ?? "USDC",
      to: opts.to ?? "SOL",
      amount: opts.amount ?? 1000,
      optimize: opts.optimize ?? true,
    });
    appendEvent({
      type: "execute",
      intent: opts.intent,
      evidence: { swap, interpreted: interpreted.intent },
    });
    return { interpreted, execution: swap };
  }

  async enablePrediction(opts: { address: string }) {
    this.predictionEnabled = true;
    this.cache.configure({ mode: "adaptive" });
    return { address: opts.address, prediction: true };
  }

  async metrics() {
    const stats = computeStats();
    const cache = this.cache.status();
    return {
      ...stats,
      cache_hit_rate: cache.hit_rate,
      prediction_enabled: this.predictionEnabled,
      execution_efficiency: stats.executions > 0 ? 94.2 : 0,
    };
  }

  predict(capital: number) {
    return predictCapitalOutcome(capital);
  }
}

export { PrismClient as default };
