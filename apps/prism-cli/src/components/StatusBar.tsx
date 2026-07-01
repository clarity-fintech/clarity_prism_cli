import { portFeedLabel } from "../lib/port-backed";
import { versionLabel } from "../lib/version";

interface StatusBarProps {
  funnelLabel?: string;
  contextLeft?: number;
  sandbox?: boolean;
  queuePending?: number;
  queueRunning?: boolean;
  portLabel?: string;
}

export default function StatusBar({
  funnelLabel = "Home",
  contextLeft = 100,
  sandbox = false,
  queuePending = 0,
  queueRunning = false,
  portLabel = "API · :8545",
}: StatusBarProps) {
  const queueLabel =
    queuePending > 0 || queueRunning
      ? `queue ${queuePending} pending${queueRunning ? " · running" : ""}`
      : "queue idle";

  return (
    <footer className="statusbar">
      <div className="statusbar-left">{funnelLabel}</div>
      <div className="statusbar-center">
        <span className="terminal-only-pill">TERMINAL ONLY</span>
        <span className="statusbar-port">{portLabel || portFeedLabel()}</span>
        <span className={sandbox ? "" : "warn"}>{sandbox ? "sandbox" : "no"}</span> sandbox{" "}
        <span>(see /docs)</span> · <span className="queue-badge">{queueLabel}</span>
      </div>
      <div className="statusbar-right">
        prism {versionLabel()} ({contextLeft}% context left)
      </div>
    </footer>
  );
}
