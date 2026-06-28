interface StatusBarProps {
  contextLeft?: number;
  sandbox?: boolean;
  queuePending?: number;
  queueRunning?: boolean;
}

export default function StatusBar({
  contextLeft = 100,
  sandbox = false,
  queuePending = 0,
  queueRunning = false,
}: StatusBarProps) {
  const queueLabel =
    queuePending > 0 || queueRunning
      ? `queue ${queuePending} pending${queueRunning ? " · running" : ""}`
      : "queue idle";

  return (
    <footer className="statusbar">
      <div className="statusbar-left">~</div>
      <div className="statusbar-center">
        <span className={sandbox ? "" : "warn"}>{sandbox ? "sandbox" : "no"}</span> sandbox{" "}
        <span>(see /docs)</span> · <span className="queue-badge">{queueLabel}</span>
      </div>
      <div className="statusbar-right">
        prism-cli v1.0.0 ({contextLeft}% context left)
      </div>
    </footer>
  );
}
