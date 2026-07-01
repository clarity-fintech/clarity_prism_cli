import { apiFetch, getApiBaseUrl } from "./prism-bridge";
import { isLocalTerminal } from "./local-mode";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "local";

let state: ConnectionState = isLocalTerminal() ? "local" : "disconnected";
const listeners = new Set<() => void>();

function notify(): void {
  for (const fn of listeners) fn();
}

export function getConnectionState(): ConnectionState {
  return state;
}

export function subscribeConnection(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isApiConnected(): boolean {
  return state === "connected";
}

export function getPortLabel(): string {
  if (isLocalTerminal()) return "local";
  const base = getApiBaseUrl();
  try {
    const url = new URL(base || "http://127.0.0.1:8545");
    return `:${url.port || "8545"}`;
  } catch {
    return ":8545";
  }
}

export function getApiHostLabel(): string {
  if (isLocalTerminal()) return "LOCAL · OFFLINE";
  const port = getPortLabel();
  if (state === "connected") return `LIVE · ${port} connected`;
  if (state === "connecting") return `API connecting · ${port}`;
  return `API disconnected · ${port} · retrying`;
}

/** Probe clrty-api — GET /v1/status + /v1/prism/status */
export async function probeApiConnection(): Promise<boolean> {
  if (isLocalTerminal()) {
    state = "local";
    notify();
    return false;
  }

  state = "connecting";
  notify();

  const [status, prism] = await Promise.all([
    apiFetch("/v1/status"),
    apiFetch("/v1/prism/status"),
  ]);
  const ok = status !== null && prism !== null;
  state = ok ? "connected" : "disconnected";
  notify();
  return ok;
}

/** Retry probe on interval when disconnected (full mode only). */
export function startConnectionRetry(intervalMs = 5000): () => void {
  if (isLocalTerminal()) return () => undefined;

  const id = window.setInterval(() => {
    if (state !== "connected") void probeApiConnection();
  }, intervalMs);

  return () => window.clearInterval(id);
}
