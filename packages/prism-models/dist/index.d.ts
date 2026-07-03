export interface PorInput {
    intent?: string;
    wallet_entropy?: number;
    spread_bps?: number;
}
export declare function relevanceScore(input: PorInput): number;
export declare function proofOfRelevance(input: PorInput): boolean;
export declare function predictCapitalOutcome(capital: number): {
    confidence: number;
    expected_yield_bps: number;
    risk_score: number;
};
//# sourceMappingURL=index.d.ts.map