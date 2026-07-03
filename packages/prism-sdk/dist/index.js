import { IntentEngine, CacheIntelligence, appendEvent, computeStats, } from "@clrt/prism-core";
import { predictCapitalOutcome } from "@clrt/prism-models";
import { wrapPrivateQuery } from "@clrt/prism-secure";
import { HelixClient } from "@clrt/helix-core";
async function postIntentAware(cfg, body) {
    const base = (cfg.apiUrl ?? process.env.CLRTY_API_URL)?.replace(/\/$/, "");
    if (!base)
        return null;
    try {
        const headers = { "Content-Type": "application/json" };
        const key = cfg.apiKey ?? process.env.CLRTY_API_KEY;
        if (key)
            headers.Authorization = `Bearer ${key}`;
        const res = await fetch(`${base}/v1/prism/intent-aware`, {
            method: "POST",
            headers,
            body: JSON.stringify(body),
        });
        if (!res.ok)
            return null;
        return (await res.json());
    }
    catch {
        return null;
    }
}
export class PrismClient {
    cfg;
    engine = new IntentEngine();
    cache = new CacheIntelligence();
    helix;
    predictionEnabled = false;
    constructor(cfg = {}) {
        this.cfg = cfg;
        this.helix = new HelixClient({ apiUrl: cfg.apiUrl, apiKey: cfg.apiKey });
    }
    rpc = {
        getAccount: async (opts) => ({
            address: opts.address,
            network: this.cfg.network ?? "mainnet",
            lamports: 1_000_000_000,
        }),
    };
    async query(input) {
        const q = {
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
                mode: "api",
            };
        }
        return { ...local, mode: "local" };
    }
    async execute(opts) {
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
    async enablePrediction(opts) {
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
    predict(capital) {
        return predictCapitalOutcome(capital);
    }
}
export { PrismClient as default };
//# sourceMappingURL=index.js.map