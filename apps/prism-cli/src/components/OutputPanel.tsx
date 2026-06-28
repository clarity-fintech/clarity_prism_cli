import clsx from "clsx";
import type { LogEntry } from "../lib/useQueryQueue";

interface OutputPanelProps {
  entries: LogEntry[];
}

export default function OutputPanel({ entries }: OutputPanelProps) {
  if (!entries.length) return null;
  return (
    <div className="output-panel">
      {entries.map((entry) => (
        <div key={entry.id} className="output-block">
          <div className="output-user">&gt; {entry.userText}</div>
          {entry.status === "queued" && (
            <div className="output-line muted">… queued ({entry.status})</div>
          )}
          {entry.status === "running" && (
            <div className="output-line prism">… processing</div>
          )}
          {entry.lines.map((line, i) => (
            <div key={i} className={clsx("output-line", line.tone)}>
              {line.text}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
