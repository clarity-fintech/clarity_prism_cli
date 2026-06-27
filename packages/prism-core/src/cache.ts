export type CacheMode = "adaptive" | "aggressive" | "minimal";

export interface CacheStats {
  mode: CacheMode;
  entries: number;
  hit_rate: number;
  saved_queries: number;
}

export class CacheIntelligence {
  private mode: CacheMode = "adaptive";
  private hits = 0;
  private misses = 0;
  private store = new Map<string, { value: unknown; ts: number }>();

  configure(opts: { mode?: CacheMode }): void {
    if (opts.mode) this.mode = opts.mode;
  }

  get(key: string): unknown | undefined {
    const entry = this.store.get(key);
    if (entry) {
      this.hits++;
      return entry.value;
    }
    this.misses++;
    return undefined;
  }

  set(key: string, value: unknown): void {
    this.store.set(key, { value, ts: Date.now() });
    if (this.mode === "minimal" && this.store.size > 50) {
      const first = this.store.keys().next().value;
      if (first) this.store.delete(first);
    }
  }

  status(): CacheStats {
    const total = this.hits + this.misses;
    return {
      mode: this.mode,
      entries: this.store.size,
      hit_rate: total > 0 ? Math.round((this.hits / total) * 1000) / 10 : 0,
      saved_queries: this.hits,
    };
  }
}
