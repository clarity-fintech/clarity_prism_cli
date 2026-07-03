import { type PrismClientConfig } from "@clrt/prism-sdk";
export interface PipelineInput {
    intent: string;
    capital?: number;
    from?: string;
    to?: string;
    amount?: number;
}
export interface PipelineStep {
    layer: "PRISM" | "HELIX" | "CHAIN";
    action: string;
    detail?: string;
}
export interface PipelineResult {
    steps: PipelineStep[];
    interpreted: unknown;
    simulation: unknown;
    execution: unknown;
    protection: unknown;
    chain_commit: string;
}
export declare class PrismHelix {
    private prism;
    private helix;
    constructor(cfg?: PrismClientConfig);
    execute(input: PipelineInput): Promise<PipelineResult>;
}
export { PrismHelix as default };
//# sourceMappingURL=index.d.ts.map