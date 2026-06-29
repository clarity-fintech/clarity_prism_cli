export type CLRTYWalletOptions = {
  api?: string;
  rpc?: string;
  username?: string;
};

export class CLRTYWallet {
  private readonly api: string;
  private readonly rpc: string;
  private username?: string;

  private constructor(opts: CLRTYWalletOptions) {
    this.api = opts.api ?? "http://127.0.0.1:8545";
    this.rpc = opts.rpc ?? "http://127.0.0.1:8899";
    this.username = opts.username;
  }

  static connect(opts: CLRTYWalletOptions = {}): CLRTYWallet {
    return new CLRTYWallet(opts);
  }

  bindUsername(username: string): void {
    this.username = username.trim().toLowerCase();
  }

  getUsername(): string | undefined {
    return this.username;
  }

  async getBalance(address: string): Promise<{ address: string; balance: string; decimals: number }> {
    try {
      const res = await fetch(this.rpc, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "clrty_getBalance", params: [address] }),
      });
      const body = (await res.json()) as { result?: string };
      return { address, balance: body.result ?? "0", decimals: 9 };
    } catch {
      return { address, balance: "0", decimals: 9 };
    }
  }

  async suggestBridgePath(opts: { wallet: string; amount?: bigint }): Promise<Record<string, unknown>> {
    const q = new URLSearchParams({ wallet: opts.wallet, amount: String(opts.amount ?? 0n) });
    const res = await fetch(`${this.api}/v1/wallet/bridge/suggest?${q}`);
    return (await res.json()) as Record<string, unknown>;
  }

  async signTransaction(opts: { wallet: string; payload: unknown }): Promise<Record<string, unknown>> {
    const res = await fetch(`${this.api}/v1/wallet/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        wallet: opts.wallet,
        payload: opts.payload,
        username: this.username,
      }),
    });
    return (await res.json()) as Record<string, unknown>;
  }

  async fetchRegistry(): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${this.api}/v1/wallet/registry`);
      if (!res.ok) {
        return { mode: "local", chain: "clrty-1", status: "offline" };
      }
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return { mode: "local", chain: "clrty-1", status: "offline" };
    }
  }

  async fetchNodes(): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${this.api}/v1/wallet/nodes`);
      if (!res.ok) {
        return { nodes: [], mode: "stub", count: 25 };
      }
      return (await res.json()) as Record<string, unknown>;
    } catch {
      return { nodes: [], mode: "stub", count: 25, status: "offline" };
    }
  }

  async registerWallet(opts: { address: string; username: string }): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${this.api}/v1/wallet/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: opts.address, environment: "core" }),
      });
      if (!res.ok) {
        return { ok: false, address: opts.address, username: opts.username, mode: "local" };
      }
      const data = (await res.json()) as Record<string, unknown>;
      return { ok: true, address: opts.address, username: opts.username, ...data };
    } catch {
      return { ok: false, address: opts.address, username: opts.username, mode: "local" };
    }
  }
}
