import { CacheIntelligence } from "@clrt/prism-core";
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
export declare class PrismClient {
    private cfg;
    private engine;
    cache: CacheIntelligence;
    private helix;
    private predictionEnabled;
    constructor(cfg?: PrismClientConfig);
    rpc: {
        getAccount: (opts: {
            address: string;
        }) => Promise<{
            address: string;
            network: "devnet" | "testnet" | "mainnet";
            lamports: number;
        }>;
    };
    query(input: PrismQueryInput): Promise<{
        intent: string;
        confidence: number;
        relevance_score: number;
        proof_of_relevance: boolean;
        suggested_routes: string[];
        prefetch: Record<string, unknown>;
        capital_context: Record<string, unknown>;
        mode: "api";
    } | {
        mode: "local";
        intent: string;
        confidence: number;
        relevance_score: number;
        proof_of_relevance: boolean;
        suggested_routes: string[];
        prefetch: Record<string, unknown>;
        capital_context: Record<string, unknown>;
    }>;
    execute(opts: {
        intent: string;
        from?: string;
        to?: string;
        amount?: number;
        optimize?: boolean;
    }): Promise<{
        interpreted: {
            intent: string;
            confidence: number;
            relevance_score: number;
            proof_of_relevance: boolean;
            suggested_routes: string[];
            prefetch: Record<string, unknown>;
            capital_context: Record<string, unknown>;
            mode: "api";
        } | {
            mode: "local";
            intent: string;
            confidence: number;
            relevance_score: number;
            proof_of_relevance: boolean;
            suggested_routes: string[];
            prefetch: Record<string, unknown>;
            capital_context: Record<string, unknown>;
        };
        execution: import("@clrt/helix-core").SwapResult;
    }>;
    enablePrediction(opts: {
        address: string;
    }): Promise<{
        address: string;
        prediction: boolean;
    }>;
    metrics(): Promise<{
        cache_hit_rate: number;
        prediction_enabled: boolean;
        execution_efficiency: number;
        total_events: number;
        validations: number;
        validation_pass_rate: number;
        queries: number;
        executions: number;
        latency_saved_ms: number;
        prediction_accuracy: number;
    }>;
    predict(capital: number): {
        confidence: number;
        expected_yield_bps: number;
        risk_score: number;
    };
}
export { PrismClient as default };
//# sourceMappingURL=index.d.ts.map