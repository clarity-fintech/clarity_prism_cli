import clsx from "clsx";
import type { OutputLine } from "../lib/prism-bridge";

interface OutputPanelProps {
  lines: OutputLine[];
}

export default function OutputPanel({ lines }: OutputPanelProps) {
  if (!lines.length) return null;
  return (
    <div className="output-panel">
      {lines.map((line, i) => (
        <div key={i} className={clsx("output-line", line.tone)}>
          {line.text}
        </div>
      ))}
    </div>
  );
}
