export interface LiquidityScan {
    pair: string;
    depth_usd: number;
    venues: {
        name: string;
        depth_usd: number;
        slippage_bps: number;
    }[];
    best_route: string;
}
export declare function scanLiquidity(pair: string): LiquidityScan;
export declare function minimizeSlippage(amount: number, depth: number): number;
//# sourceMappingURL=index.d.ts.map