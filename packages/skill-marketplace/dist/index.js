export const MARKETPLACE_MANIFEST = [
    {
        id: "market-arbitrage-skill",
        name: "Market Arbitrage",
        version: "1.0.0",
        description: "Scan cross-venue spreads with capital-aware constraints",
        capital_aware: true,
    },
    {
        id: "trend-momentum-skill",
        name: "Trend Momentum",
        version: "1.0.0",
        description: "Momentum signal generation with PRISM context",
        capital_aware: true,
    },
    {
        id: "payment-executor-skill",
        name: "Payment Executor",
        version: "1.0.0",
        description: "Deterministic payment rail via HELIX",
        capital_aware: true,
    },
    {
        id: "risk-manager-skill",
        name: "Risk Manager",
        version: "1.0.0",
        description: "Exposure guardrails and risk scoring",
        capital_aware: true,
    },
];
export function listSkills() {
    return MARKETPLACE_MANIFEST;
}
export function getSkill(id) {
    return MARKETPLACE_MANIFEST.find((s) => s.id === id || s.id.startsWith(id));
}
//# sourceMappingURL=index.js.map