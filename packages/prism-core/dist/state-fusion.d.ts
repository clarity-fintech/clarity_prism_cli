export interface FusedState {
    sources: string[];
    merged_at: string;
    snapshot: Record<string, unknown>;
}
export declare class StateFusion {
    fuse(sources: Record<string, unknown>[]): FusedState;
}
//# sourceMappingURL=state-fusion.d.ts.map