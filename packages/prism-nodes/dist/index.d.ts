import { IntentEngine, CacheIntelligence, StateFusion, QueryMinimizer } from "@clrt/prism-core";
declare const engine: IntentEngine;
declare const cache: CacheIntelligence;
declare const fusion: StateFusion;
declare const minimizer: QueryMinimizer;
export declare const NODE_IDS: readonly ["predictive-query-node", "intent-aware-rpc-node", "state-compression-node", "multi-source-fusion-node", "capital-context-node", "query-minimizer-node", "ai-cache-node", "cross-chain-shadow-node"];
export type NodeId = (typeof NODE_IDS)[number];
export declare function runNode(id: NodeId, input: Record<string, unknown>): import("@clrt/prism-core").IntentResult | import("@clrt/prism-core").FusedState | {
    compressed: boolean;
    keys: number;
    skip?: undefined;
    hit?: undefined;
    value?: undefined;
    stored?: undefined;
    chains?: undefined;
    shadow_sync?: undefined;
    error?: undefined;
} | {
    skip: boolean;
    compressed?: undefined;
    keys?: undefined;
    hit?: undefined;
    value?: undefined;
    stored?: undefined;
    chains?: undefined;
    shadow_sync?: undefined;
    error?: undefined;
} | {
    hit: boolean;
    value: {} | null;
    compressed?: undefined;
    keys?: undefined;
    skip?: undefined;
    stored?: undefined;
    chains?: undefined;
    shadow_sync?: undefined;
    error?: undefined;
} | {
    hit: boolean;
    stored: boolean;
    compressed?: undefined;
    keys?: undefined;
    skip?: undefined;
    value?: undefined;
    chains?: undefined;
    shadow_sync?: undefined;
    error?: undefined;
} | {
    chains: {};
    shadow_sync: boolean;
    compressed?: undefined;
    keys?: undefined;
    skip?: undefined;
    hit?: undefined;
    value?: undefined;
    stored?: undefined;
    error?: undefined;
} | {
    error: string;
    compressed?: undefined;
    keys?: undefined;
    skip?: undefined;
    hit?: undefined;
    value?: undefined;
    stored?: undefined;
    chains?: undefined;
    shadow_sync?: undefined;
};
export { engine, cache, fusion, minimizer };
//# sourceMappingURL=index.d.ts.map