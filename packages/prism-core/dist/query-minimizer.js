export class QueryMinimizer {
    seen = new Set();
    key(intent, params) {
        return `${intent}:${JSON.stringify(params)}`;
    }
    shouldSkip(intent, params) {
        const k = this.key(intent, params);
        if (this.seen.has(k))
            return true;
        this.seen.add(k);
        return false;
    }
    reset() {
        this.seen.clear();
    }
}
//# sourceMappingURL=query-minimizer.js.map