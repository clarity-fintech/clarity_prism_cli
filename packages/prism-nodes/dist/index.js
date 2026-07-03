import { IntentEngine, CacheIntelligence, StateFusion, QueryMinimizer } from "@clrt/prism-core";
const engine = new IntentEngine();
const cache = new CacheIntelligence();
const fusion = new StateFusion();
const minimizer = new QueryMinimizer();
export const NODE_IDS = [
    "predictive-query-node",
    "intent-aware-rpc-node",
    "state-compression-node",
    "multi-source-fusion-node",
    "capital-context-node",
    "query-minimizer-node",
    "ai-cache-node",
    "cross-chain-shadow-node",
];
export function runNode(id, input) {
    switch (id) {
        case "predictive-query-node":
            return engine.interpret({
                intent: String(input.intent ?? "market_snapshot"),
                context: input,
            });
        case "intent-aware-rpc-node":
            return engine.interpret({
                intent: String(input.intent ?? "portfolio_state"),
                query: String(input.query ?? ""),
                context: input,
            });
        case "state-compression-node":
            return { compressed: true, keys: Object.keys(input).length };
        case "multi-source-fusion-node":
            return fusion.fuse([input]);
        case "capital-context-node":
            return engine.interpret({
                intent: "yield_strategy",
                context: { capital: input.capital, risk: input.risk },
            });
        case "query-minimizer-node":
            return { skip: minimizer.shouldSkip(String(input.intent ?? ""), input) };
        case "ai-cache-node": {
            const key = String(input.key ?? "default");
            const hit = cache.get(key);
            if (hit !== undefined)
                return { hit: true, value: hit };
            cache.set(key, input);
            return { hit: false, stored: true };
        }
        case "cross-chain-shadow-node":
            return {
                chains: input.chains ?? ["solana", "ethereum"],
                shadow_sync: true,
            };
        default:
            return { error: "unknown node" };
    }
}
export { engine, cache, fusion, minimizer };
//# sourceMappingURL=index.js.map