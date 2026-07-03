export class CacheIntelligence {
    mode = "adaptive";
    hits = 0;
    misses = 0;
    store = new Map();
    configure(opts) {
        if (opts.mode)
            this.mode = opts.mode;
    }
    get(key) {
        const entry = this.store.get(key);
        if (entry) {
            this.hits++;
            return entry.value;
        }
        this.misses++;
        return undefined;
    }
    set(key, value) {
        this.store.set(key, { value, ts: Date.now() });
        if (this.mode === "minimal" && this.store.size > 50) {
            const first = this.store.keys().next().value;
            if (first)
                this.store.delete(first);
        }
    }
    status() {
        const total = this.hits + this.misses;
        return {
            mode: this.mode,
            entries: this.store.size,
            hit_rate: total > 0 ? Math.round((this.hits / total) * 1000) / 10 : 0,
            saved_queries: this.hits,
        };
    }
}
//# sourceMappingURL=cache.js.map