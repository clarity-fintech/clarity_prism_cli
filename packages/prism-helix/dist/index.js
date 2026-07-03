import { PrismClient } from "@clrt/prism-sdk";
import { HelixClient } from "@clrt/helix-core";
import { applyProtection } from "@clrt/helix-protect";
import { comparePaths } from "@clrt/helix-sim";
import { appendEvent } from "@clrt/prism-core";
export class PrismHelix {
    prism;
    helix;
    constructor(cfg = {}) {
        this.prism = new PrismClient(cfg);
        this.helix = new HelixClient({ apiUrl: cfg.apiUrl, apiKey: cfg.apiKey });
    }
    async execute(input) {
        const steps = [];
        steps.push({ layer: "PRISM", action: "interpreting intent", detail: input.intent });
        const interpreted = await this.prism.query({
            intent: input.intent,
            context: { capital: input.capital },
        });
        steps.push({ layer: "PRISM", action: "forecasting outcomes" });
        const forecast = this.prism.predict(input.capital ?? 1000);
        steps.push({ layer: "HELIX", action: "simulating execution paths" });
        const simReq = {
            from: input.from ?? "USDC",
            to: input.to ?? "SOL",
            amount: input.amount ?? input.capital ?? 1000,
        };
        const simulation = comparePaths(simReq);
        steps.push({ layer: "HELIX", action: "selecting optimal route", detail: simulation.recommended });
        const protection = applyProtection({ privateLane: true, mevShield: true });
        const execution = this.helix.executeSwap({ ...simReq, optimize: true });
        steps.push({ layer: "CHAIN", action: "executing transaction", detail: execution.tx_ref });
        const chain_commit = `commit-${Date.now().toString(36)}`;
        appendEvent({
            type: "execute",
            intent: input.intent,
            evidence: { forecast, simulation, execution, chain_commit },
        });
        return {
            steps,
            interpreted: { ...interpreted, forecast },
            simulation,
            execution,
            protection,
            chain_commit,
        };
    }
}
export { PrismHelix as default };
//# sourceMappingURL=index.js.map