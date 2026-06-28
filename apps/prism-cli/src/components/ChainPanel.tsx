import { useEffect, useState } from "react";
import clsx from "clsx";
import { fetchChainStatus, fetchChainReady, type ChainStatus, type ChainReadyMatrix } from "../lib/prism-bridge";

export default function ChainPanel() {
  const [status, setStatus] = useState<ChainStatus | null>(null);
  const [ready, setReady] = useState<ChainReadyMatrix | null>(null);

  useEffect(() => {
    void fetchChainReady().then(setReady);
    void fetchChainStatus().then(setStatus);
    const id = setInterval(() => {
      void fetchChainReady().then(setReady);
      void fetchChainStatus().then(setStatus);
    }, 15000);
    return () => clearInterval(id);
  }, []);

  if (!status) {
    return (
      <div className="funnel-panel">
        <div className="funnel-panel-title">clrty-1 chain</div>
        <div className="funnel-card-value">Loading chain status…</div>
      </div>
    );
  }

  return (
    <div className="funnel-panel">
      <div className="funnel-panel-title">clrty-1 chain status</div>
      {ready && (
        <div className="funnel-panel-grid" style={{ marginBottom: 12 }}>
          <div className="funnel-card">
            <div className="funnel-card-label">Ready gate</div>
            <div className={clsx("funnel-card-value", ready.ready ? "ok" : "warn")}>
              {ready.ready ? "PASS" : "PARTIAL"} ({ready.pass}/{ready.total})
            </div>
          </div>
          {ready.matrix.map((row) => (
            <div className="funnel-card" key={row.id}>
              <div className="funnel-card-label">{row.label}</div>
              <div className={clsx("funnel-card-value", row.pass ? "ok" : "warn")}>
                {row.pass ? "ok" : "fail"}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="funnel-panel-grid">
        <div className="funnel-card">
          <div className="funnel-card-label">Chain ID</div>
          <div className="funnel-card-value">{status.chainId}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Block height</div>
          <div className="funnel-card-value">{status.blockHeight.toLocaleString()}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Status</div>
          <div className={clsx("funnel-card-value", status.healthy ? "ok" : "warn")}>
            {status.status}
          </div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Mode</div>
          <div className="funnel-card-value">{status.mode}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">Attestations</div>
          <div className="funnel-card-value">{status.attestations}</div>
        </div>
        <div className="funnel-card">
          <div className="funnel-card-label">State root</div>
          <div className="funnel-card-value" style={{ fontSize: 11 }}>
            {status.stateRoot.slice(0, 16)}…
          </div>
        </div>
      </div>
    </div>
  );
}
