import { useCallback, useEffect, useRef, useState } from "react";
import type { OutputLine } from "./prism-bridge";

export interface LogEntry {
  id: string;
  userText: string;
  lines: OutputLine[];
  status: "queued" | "running" | "done" | "error";
}

type Runner = (text: string) => Promise<OutputLine[]>;

let seq = 0;

export function useQueryQueue(runner: Runner) {
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [pending, setPending] = useState(0);
  const [running, setRunning] = useState(false);
  const queueRef = useRef<Array<{ id: string; text: string }>>([]);
  const processingRef = useRef(false);
  const runnerRef = useRef(runner);
  runnerRef.current = runner;

  const drain = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    setRunning(true);
    try {
      while (queueRef.current.length) {
        const job = queueRef.current.shift()!;
        setPending(queueRef.current.length);
        setEntries((prev) =>
          prev.map((e) => (e.id === job.id ? { ...e, status: "running" } : e))
        );
        try {
          const lines = await runnerRef.current(job.text);
          setEntries((prev) =>
            prev.map((e) => (e.id === job.id ? { ...e, lines, status: "done" } : e))
          );
        } catch (err) {
          setEntries((prev) =>
            prev.map((e) =>
              e.id === job.id
                ? {
                    ...e,
                    status: "error",
                    lines: [{ text: err instanceof Error ? err.message : String(err), tone: "risk" }],
                  }
                : e
            )
          );
        }
      }
    } finally {
      processingRef.current = false;
      setRunning(false);
      setPending(0);
    }
  }, []);

  const enqueue = useCallback(
    (text: string) => {
      const id = `ui-${++seq}`;
      queueRef.current.push({ id, text });
      setPending(queueRef.current.length);
      setEntries((prev) => [...prev.slice(-39), { id, userText: text, lines: [], status: "queued" }]);
      void drain();
      return id;
    },
    [drain]
  );

  useEffect(() => {
    if (queueRef.current.length && !processingRef.current) void drain();
  }, [drain, entries.length]);

  return { entries, enqueue, pending, running };
}
