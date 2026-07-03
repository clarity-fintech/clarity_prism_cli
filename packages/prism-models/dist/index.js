const THRESHOLD = 0.55;
export function relevanceScore(input) {
    const base = 0.45;
    const intentBonus = (input.intent?.length ?? 0) > 3 ? 0.15 : 0;
    const entropy = input.wallet_entropy ?? 0.5;
    const spread = input.spread_bps ?? 0;
    const spreadPenalty = Math.min(0.2, spread / 500);
    return Math.max(0, Math.min(1, base + intentBonus + entropy * 0.25 - spreadPenalty));
}
export function proofOfRelevance(input) {
    return relevanceScore(input) >= THRESHOLD;
}
export function predictCapitalOutcome(capital) {
    const confidence = Math.min(99.9, 70 + Math.log10(Math.max(capital, 1)) * 5);
    return {
        confidence: Math.round(confidence * 10) / 10,
        expected_yield_bps: Math.round(120 + capital / 1000),
        risk_score: Math.max(0.1, Math.min(0.9, 0.5 - capital / 100000)),
    };
}
//# sourceMappingURL=index.js.map