export type CLRTYWalletOptions = {
    api?: string;
    rpc?: string;
    username?: string;
};
export declare class CLRTYWallet {
    private readonly api;
    private readonly rpc;
    private username?;
    private constructor();
    static connect(opts?: CLRTYWalletOptions): CLRTYWallet;
    bindUsername(username: string): void;
    getUsername(): string | undefined;
    getBalance(address: string): Promise<{
        address: string;
        balance: string;
        decimals: number;
    }>;
    suggestBridgePath(opts: {
        wallet: string;
        amount?: bigint;
    }): Promise<Record<string, unknown>>;
    signTransaction(opts: {
        wallet: string;
        payload: unknown;
    }): Promise<Record<string, unknown>>;
    fetchRegistry(): Promise<Record<string, unknown>>;
    fetchNodes(): Promise<Record<string, unknown>>;
    registerWallet(opts: {
        address: string;
        username: string;
    }): Promise<Record<string, unknown>>;
}
//# sourceMappingURL=index.d.ts.map