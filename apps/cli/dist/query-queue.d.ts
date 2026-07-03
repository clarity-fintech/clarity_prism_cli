import { QueryQueue } from "@clrt/prism-core";
import { PrismClient } from "@clrt/prism-sdk";
export type QueryResult = Awaited<ReturnType<PrismClient["query"]>>;
export declare const prismQueryQueue: QueryQueue<{
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
//# sourceMappingURL=query-queue.d.ts.map