export interface HelixConfig {
    apiUrl?: string;
    apiKey?: string;
}
export interface HelixStatus {
    tick: number;
    kernel_running: boolean;
    intents_resolved: number;
    net_flow_count: number;
    shadow_dir: string;
    mode: "api" | "local";
}
export interface SwapRequest {
    from: string;
    to: string;
    amount: number;
    optimize?: boolean;
}
export interface SwapResult {
    routes: string[];
    slippage_pct: number;
    savings_pct: number;
    status: "simulated" | "executed";
    tx_ref?: string;
}
export declare class HelixClient {
    private cfg;
    constructor(cfg?: HelixConfig);
    status(): Promise<HelixStatus>;
    submitIntent(amount: number, asset?: string): Promise<unknown>;
    netPreview(from: string, to: string, amount: number): Promise<unknown>;
    executeSwap(req: SwapRequest): SwapResult;
    simulateSwap(req: SwapRequest): SwapResult;
}
//# sourceMappingURL=index.d.ts.map