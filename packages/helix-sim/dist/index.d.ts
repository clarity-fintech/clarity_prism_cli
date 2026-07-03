import { type SwapRequest } from "@clrt/helix-core";
export interface SimComparison {
    paths: {
        name: string;
        slippage_pct: number;
        risk_score: number;
    }[];
    recommended: string;
    outcome_prediction: string;
}
export declare function comparePaths(req: SwapRequest): SimComparison;
//# sourceMappingURL=index.d.ts.map