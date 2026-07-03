export interface GlobalFlags {
    json: boolean;
    dryRun: boolean;
}
export declare function parseGlobalFlags(opts: {
    json?: boolean;
    dryRun?: boolean;
}): GlobalFlags;
export declare function shouldDryRun(flags: GlobalFlags): boolean;
export declare function formatOutput(data: unknown, json: boolean): void;
//# sourceMappingURL=json-dry-run.d.ts.map