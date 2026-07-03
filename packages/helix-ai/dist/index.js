const DEFAULT = { latency: 0.35, slippage: 0.45, mev_resistance: 0.2 };
export class AdaptiveEngine {
    weights = { ...DEFAULT };
    history = [];
    tune(performanceScore) {
        this.history.push({ score: performanceScore, ts: Date.now() });
        if (this.history.length > 100)
            this.history.shift();
        const avg = this.history.reduce((s, h) => s + h.score, 0) / Math.max(1, this.history.length);
        if (avg > 0.8) {
            this.weights.slippage += 0.02;
            this.weights.latency -= 0.01;
        }
        else {
            this.weights.mev_resistance += 0.02;
        }
        return { ...this.weights };
    }
    getWeights() {
        return { ...this.weights };
    }
}
//# sourceMappingURL=index.js.map