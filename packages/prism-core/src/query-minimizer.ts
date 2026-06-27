export class QueryMinimizer {
  private seen = new Set<string>();

  key(intent: string, params: Record<string, unknown>): string {
    return `${intent}:${JSON.stringify(params)}`;
  }

  shouldSkip(intent: string, params: Record<string, unknown>): boolean {
    const k = this.key(intent, params);
    if (this.seen.has(k)) return true;
    this.seen.add(k);
    return false;
  }

  reset(): void {
    this.seen.clear();
  }
}
