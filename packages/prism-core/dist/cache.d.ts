export type CacheMode = "adaptive" | "aggressive" | "minimal";
export interface CacheStats {
    mode: CacheMode;
    entries: number;
    hit_rate: number;
    saved_queries: number;
}
export declare class CacheIntelligence {
    private mode;
    private hits;
    private misses;
    private store;
    configure(opts: {
        mode?: CacheMode;
    }): void;
    get(key: string): unknown | undefined;
    set(key: string, value: unknown): void;
    status(): CacheStats;
}
//# sourceMappingURL=cache.d.ts.map