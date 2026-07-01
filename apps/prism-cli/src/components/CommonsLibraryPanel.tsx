import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import {
  fetchCommonsCacheStatus,
  fetchCommonsLibrary,
  fetchCommonsLedger,
  pasteToCommonsCache,
  copyCommonsCacheCid,
  sendCommonsFromTerminal,
  loadBrowserProfile,
  type CommonsCacheStatus,
  type CommonsLedgerEntry,
} from "../lib/prism-bridge";
import { isLocalTerminal } from "../lib/local-mode";
import {
  getApiHostLabel,
  getConnectionState,
  isApiConnected,
  probeApiConnection,
  startConnectionRetry,
  subscribeConnection,
} from "../lib/port-connection";

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function CommonsLibraryPanel() {
  const profile = loadBrowserProfile();
  const username = profile?.username ?? "guest";
  const apiLive = isApiConnected();
  const [connState, setConnState] = useState(getConnectionState());
  const [cache, setCache] = useState<CommonsCacheStatus | null>(null);
  const [library, setLibrary] = useState<unknown[]>([]);
  const [libraryMode, setLibraryMode] = useState<"api" | "offline" | "browser">("offline");
  const [ledger, setLedger] = useState<CommonsLedgerEntry[]>([]);
  const [pasteText, setPasteText] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [lastCid, setLastCid] = useState<{ cid: string; size: number; name: string } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const cacheMode = cache?.mode ?? "offline";

  useEffect(() => {
    void probeApiConnection();
    const stopRetry = startConnectionRetry();
    const unsub = subscribeConnection(() => setConnState(getConnectionState()));
    return () => {
      stopRetry();
      unsub();
    };
  }, []);

  const refresh = useCallback(async () => {
    const [c, lib, led] = await Promise.all([
      fetchCommonsCacheStatus(username),
      fetchCommonsLibrary(),
      fetchCommonsLedger(15),
    ]);
    setCache(c);
    setLibrary(lib.library);
    setLibraryMode(lib.mode);
    setLedger(led);
  }, [username]);

  useEffect(() => {
    void refresh();
  }, [refresh, connState]);

  const handlePaste = async () => {
    setError(null);
    setMessage(null);
    if (!apiLive) {
      setError("API disconnected — start clrty-api on port 8545");
      return;
    }
    if (!pasteText.trim()) {
      setError("Paste content first");
      return;
    }
    setBusy(true);
    try {
      const entry = await pasteToCommonsCache(pasteText, username);
      setLastCid({ cid: entry.cid, size: entry.size, name: entry.name });
      setMessage(`Cached: ${entry.name} (${entry.cid.slice(0, 12)}…)`);
      setPasteText("");
      await refresh();
    } catch (e) {
      setError(String(e));
    }
    setBusy(false);
  };

  const handleSend = async () => {
    setError(null);
    setMessage(null);
    if (!apiLive) {
      setError("API disconnected — transfer and tax logging require clrty-api");
      return;
    }
    if (!sendTo.trim()) {
      setError("Enter recipient username");
      return;
    }
    if (!lastCid) {
      setError("Paste to cache first, then send");
      return;
    }
    setBusy(true);
    const result = await sendCommonsFromTerminal(sendTo, lastCid.cid, lastCid.size, lastCid.name);
    setBusy(false);
    if (!result.ok) {
      setError(result.error ?? "send failed");
      return;
    }
    const tax = result.taxes as { total_tax?: number } | undefined;
    setMessage(
      `Sent to @${sendTo.trim().toLowerCase()} — taxes: ${tax?.total_tax ?? "logged"} CLRTY`
    );
    await refresh();
  };

  const handleCopyCid = async (cid: string) => {
    setError(null);
    setMessage(null);
    if (!apiLive) {
      setError("API disconnected — copy requires clrty-api on port 8545");
      return;
    }
    try {
      const content = await copyCommonsCacheCid(cid, username);
      try {
        await navigator.clipboard.writeText(content);
        setMessage("Copied to clipboard");
      } catch {
        setMessage(content.slice(0, 200));
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const maxLabel =
    cacheMode === "api" ? "1 GB" : cacheMode === "browser" ? "50 MB (browser)" : "1 GB (API required)";

  return (
    <div className="funnel-panel commons-library-panel">
      <div className="commons-terminal-only-header">
        <span className="commons-terminal-only-badge">TERMINAL USE ONLY</span>
        <span
          className={clsx(
            "commons-port-badge",
            apiLive ? "commons-port-live" : "commons-port-offline"
          )}
        >
          {isLocalTerminal() ? "DEV · offline" : getApiHostLabel()}
        </span>
        <span className="commons-terminal-only-sub">File cache · library · P2P — not available via CLI</span>
      </div>
      <div className="funnel-panel-title">Commons File Cache & Library</div>
      {!apiLive && !isLocalTerminal() && (
        <div className="account-gate-msg err commons-offline-banner">
          Connect clrty-api on port 8545 — paste, send, copy, and ledger require the live API.
        </div>
      )}
      <div className="commons-cache-bar-wrap">
        <div className="commons-cache-bar-label">
          {username} · {formatBytes(cache?.usedBytes ?? 0)} / {maxLabel}
          {cacheMode === "api" ? " (API)" : cacheMode === "browser" ? " (local)" : " (offline)"}
        </div>
        <div className="commons-cache-bar">
          <div
            className="commons-cache-bar-fill"
            style={{ width: `${Math.min(cache?.percentUsed ?? 0, 100)}%` }}
          />
        </div>
      </div>

      <div className="commons-paste-row">
        <textarea
          className="commons-paste-input"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder={apiLive ? "Paste file content here…" : "Connect API to paste…"}
          rows={4}
          disabled={busy || !apiLive}
        />
        <div className="commons-paste-actions">
          <button
            type="button"
            className="investor-btn primary"
            disabled={busy || !apiLive}
            onClick={() => void handlePaste()}
          >
            Paste to cache
          </button>
          <button
            type="button"
            className="investor-btn"
            disabled={busy || !apiLive}
            onClick={async () => {
              try {
                const t = await navigator.clipboard.readText();
                setPasteText(t);
              } catch {
                setError("Clipboard read denied");
              }
            }}
          >
            Read clipboard
          </button>
        </div>
      </div>

      <div className="commons-send-row">
        <label>
          Send cached file to @username
          <div className="commons-send-input-row">
            <input
              type="text"
              value={sendTo}
              onChange={(e) => setSendTo(e.target.value)}
              placeholder="alice"
              disabled={busy || !apiLive}
            />
            <button
              type="button"
              className="investor-btn primary"
              disabled={busy || !apiLive || !lastCid}
              onClick={() => void handleSend()}
            >
              Send + log taxes
            </button>
          </div>
        </label>
        {lastCid && (
          <div className="commons-last-cid">
            Ready: <code>{lastCid.cid.slice(0, 16)}…</code> ({formatBytes(lastCid.size)})
          </div>
        )}
      </div>

      {message && <div className="account-gate-msg ok">{message}</div>}
      {error && <div className="account-gate-msg err">{error}</div>}

      <div className="commons-section-title">Overall library ({library.length})</div>
      <ul className="commons-file-list">
        {libraryMode === "offline" && library.length === 0 ? (
          <li className="commons-file-empty">Library unavailable — connect API</li>
        ) : library.length === 0 ? (
          <li className="commons-file-empty">No library entries yet — paste and send from this panel</li>
        ) : (
          library.slice(0, 12).map((item, i) => {
            const row = item as { cid?: string; name?: string; size?: number };
            return (
              <li key={row.cid ?? i}>
                <code>{row.cid?.slice(0, 16) ?? "—"}…</code>
                <span>{row.name ?? "asset"}</span>
                <span>{formatBytes(row.size ?? 0)}</span>
                {row.cid && (
                  <button
                    type="button"
                    className="investor-btn"
                    disabled={!apiLive}
                    onClick={() => void handleCopyCid(row.cid!)}
                  >
                    Copy
                  </button>
                )}
              </li>
            );
          })
        )}
      </ul>

      <div className="commons-section-title">Blockchain transfers (taxes included)</div>
      <ul className="commons-ledger-list">
        {ledger.length === 0 ? (
          <li className="commons-file-empty">
            {apiLive ? "No logged transfers" : "Ledger unavailable — connect API"}
          </li>
        ) : (
          ledger.map((row, i) => (
            <li key={row.id ?? row.tx_id ?? row.txId ?? i}>
              <span className="commons-ledger-tx">{row.tx_id ?? row.txId ?? "tx"}</span>
              <span>
                @{row.from_username} → @{row.to_username}
              </span>
              <span className="commons-ledger-tax">
                tax {row.taxes?.total_tax ?? 0} CLRTY
                {row.taxes?.gas_equivalent ? ` (+gas ${row.taxes.gas_equivalent})` : ""}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
