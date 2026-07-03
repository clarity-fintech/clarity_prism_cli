export interface AdaptiveWeights {
    latency: number;
    slippage: number;
    mev_resistance: number;
}
export declare class AdaptiveEngine {
    private weights;
    private history;
    tune(performanceScore: number): AdaptiveWeights;
    getWeights(): AdaptiveWeights;
}
//# sourceMappingURL=index.d.ts.map