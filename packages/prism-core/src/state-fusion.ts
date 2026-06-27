export interface FusedState {
  sources: string[];
  merged_at: string;
  snapshot: Record<string, unknown>;
}

export class StateFusion {
  fuse(sources: Record<string, unknown>[]): FusedState {
    const snapshot: Record<string, unknown> = {};
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
