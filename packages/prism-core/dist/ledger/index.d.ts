export interface LedgerEvent {
    id: string;
    timestamp: string;
    type: "query" | "validate" | "execute" | "skill" | "trace";
    agent?: "trader" | "sentinel";
    intent?: string;
    claim?: string;
    evidence?: Record<string, unknown>;
    passed?: boolean;
    parent_hash: string;
    content_hash: string;
}
export declare function repoDir(custom?: string): string;
export declare function readEvents(dir?: string): LedgerEvent[];
export declare function lastHash(dir?: string): string;
export declare function appendEvent(partial: Omit<LedgerEvent, "id" | "timestamp" | "parent_hash" | "content_hash">, dir?: string): LedgerEvent;
export interface ValidateInput {
    claim: string;
    intent: string;
    capital?: number;
}
export interface ValidateResult {
    passed: boolean;
    trader_score: number;
    sentinel_score: number;
    event: LedgerEvent;
    reasoning: string[];
}
/** Adversarial QA: Trader claim vs Sentinel challenge (MCA/TSR/AVR pattern). */
export declare function validateClaim(input: ValidateInput, dir?: string): ValidateResult;
export declare function traceLog(limit?: number, dir?: string): LedgerEvent[];
export interface LedgerStats {
    total_events: number;
    validations: number;
    validation_pass_rate: number;
    queries: number;
    executions: number;
    latency_saved_ms: number;
    prediction_accuracy: number;
}
export declare function computeStats(dir?: string): LedgerStats;
export declare function exportLedgerSnapshot(dir?: string): {
    exported_at: string;
    repo_dir: string;
    head_hash: string;
    events: LedgerEvent[];
    stats: LedgerStats;
};
//# sourceMappingURL=index.d.ts.map