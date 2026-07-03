export class StateFusion {
    fuse(sources) {
        const snapshot = {};
        for (const src of sources) {
            Object.assign(snapshot, src);
        }
        return {
            sources: sources.map((_, i) => `source-${i + 1}`),
            merged_at: new Date().toISOString(),
            snapshot,
        };
    }
}
//# sourceMappingURL=state-fusion.js.map