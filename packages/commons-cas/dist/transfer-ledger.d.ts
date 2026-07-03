export interface TaxBreakdown {
    transferFee: number;
    complianceTax: number;
    gasEquivalent: number;
    totalTax: number;
    currency: string;
    jurisdiction: string;
    basisPoints: {
        transfer: number;
        compliance: number;
    };
}
export interface BlockchainTransferLog {
    id: string;
    txId: string;
    transferId?: string;
    fromUsername: string;
    toUsername: string;
    cid: string;
    sizeBytes: number;
    notionalClrt: number;
    taxes: TaxBreakdown;
    netAfterTax: number;
    chainId: string;
    blockRef: string;
    loggedAt: string;
    status: "pending" | "confirmed" | "received";
}
/** Compute all-inclusive tax on a commons file transfer (basis + compliance + gas). */
export declare function computeTransferTax(sizeBytes: number, notionalClrt?: number): TaxBreakdown;
export declare function logBlockchainTransfer(input: {
    transferId?: string;
    fromUsername: string;
    toUsername: string;
    cid: string;
    sizeBytes: number;
    notionalClrt?: number;
    status?: BlockchainTransferLog["status"];
}): BlockchainTransferLog;
export declare function readTransferLedger(limit?: number): BlockchainTransferLog[];
export declare function getLedgerPath(): string;
//# sourceMappingURL=transfer-ledger.d.ts.map