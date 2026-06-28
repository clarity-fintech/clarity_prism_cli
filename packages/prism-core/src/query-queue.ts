export type QueueJobStatus = "queued" | "running" | "done" | "error";

export interface QueueJob<T> {
  id: string;
  label: string;
  status: QueueJobStatus;
  enqueuedAt: number;
  startedAt?: number;
  finishedAt?: number;
  result?: T;
  error?: string;
}

export interface QueryQueueSnapshot {
  pending: number;
  running: boolean;
  totalProcessed: number;
  jobs: Array<Pick<QueueJob<unknown>, "id" | "label" | "status">>;
}

type Processor<T> = (label: string) => Promise<T>;

let seq = 0;

export class QueryQueue<T = unknown> {
  private jobs: QueueJob<T>[] = [];
  private running = false;
  private totalProcessed = 0;

  constructor(private readonly processor: Processor<T>, private readonly maxDone = 50) {}

  enqueue(label: string): string {
    const id = `q-${++seq}-${Date.now().toString(36)}`;
    this.jobs.push({
      id,
      label,
      status: "queued",
      enqueuedAt: Date.now(),
    });
    void this.drain();
    return id;
  }

  snapshot(): QueryQueueSnapshot {
    const visible = this.jobs.slice(-this.maxDone);
    return {
      pending: this.jobs.filter((j) => j.status === "queued").length,
      running: this.running,
      totalProcessed: this.totalProcessed,
      jobs: visible.map(({ id, label, status }) => ({ id, label, status })),
    };
  }

  async wait(id: string, timeoutMs = 120_000): Promise<T> {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const job = this.jobs.find((j) => j.id === id);
      if (!job) throw new Error(`Unknown queue job: ${id}`);
      if (job.status === "done" && job.result !== undefined) return job.result;
      if (job.status === "error") throw new Error(job.error ?? "Queue job failed");
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(`Queue job timed out: ${id}`);
  }

  private async drain(): Promise<void> {
    if (this.running) return;
    this.running = true;
    try {
      while (true) {
        const next = this.jobs.find((j) => j.status === "queued");
        if (!next) break;
        next.status = "running";
        next.startedAt = Date.now();
        try {
          next.result = await this.processor(next.label);
          next.status = "done";
          this.totalProcessed += 1;
        } catch (err) {
          next.status = "error";
          next.error = err instanceof Error ? err.message : String(err);
        } finally {
          next.finishedAt = Date.now();
        }
      }
    } finally {
      this.running = false;
      if (this.jobs.some((j) => j.status === "queued")) void this.drain();
    }
  }
}
