import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  fetchWalletRegistry,
  type WalletSnapshot,
} from "../lib/prism-bridge";

export default function WalletPanel() {
  const [snap, setSnap] = useState<WalletSnapshot | null>(null);

  useEffect(() => {
    void fetchWalletRegistry().then(setSnap);
    const id = setInterval(() => void fetchWalletRegistry().then(setSnap), 20000);
    return () => clearInterval(id);
  }, []);

  if (!snap) {
    return (
      <div className="funnel-panel">
        <div className="funnel-panel-title">CLRTY Wallet</div>
        <div className="funnel-card-value">Loading wallet snapshot…</div>
      </div>
    );
  }

  return (
    <div className="funnel-panel">
      <div className="funnel-panel-title">CLRTY Wallet</div>
      <div className="funnel-panel-grid">
        <div className="funnel-card">
          <div className="funnel-card-label">Username</div>
          <div className="funnel-card-value">{snap.username ?? "—"}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Namespace</div>
          <div className="funnel-card-value" style={{ fontSize: 11 }}>
            {snap.namespace ?? "clrty://@"}
          </div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Balance</div>
          <div className={clsx("funnel-card-value", snap.balance ? "ok" : undefined)}>
            {snap.balance ?? "0"}
          </div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Registry</div>
          <div className="funnel-card-value">{snap.registryMode}</div>
        </div>
      </div>
      <div className="funnel-panel-desc" style={{ marginTop: 12, fontSize: 12, color: "var(--muted)" }}>
        Integration packs:{" "}
        <a
          href="https://github.com/theangelofwill/CLRTY-WALLET-INTEGRATION"
          target="_blank"
          rel="noreferrer"
        >
          CLRTY-WALLET-INTEGRATION
        </a>
        {" · "}
        <code>clrt pack download wallet-integration</code>
      </div>
    </div>
  );
}
