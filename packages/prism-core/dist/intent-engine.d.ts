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
export declare class IntentEngine {
    interpret(q: IntentQuery): IntentResult;
}
//# sourceMappingURL=intent-engine.d.ts.map