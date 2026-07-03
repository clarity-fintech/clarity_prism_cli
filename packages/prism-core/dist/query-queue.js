let seq = 0;
export class QueryQueue {
    processor;
    maxDone;
    jobs = [];
    running = false;
    totalProcessed = 0;
    constructor(processor, maxDone = 50) {
        this.processor = processor;
        this.maxDone = maxDone;
    }
    enqueue(label) {
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
    snapshot() {
        const visible = this.jobs.slice(-this.maxDone);
        return {
            pending: this.jobs.filter((j) => j.status === "queued").length,
            running: this.running,
            totalProcessed: this.totalProcessed,
            jobs: visible.map(({ id, label, status }) => ({ id, label, status })),
        };
    }
    async wait(id, timeoutMs = 120_000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const job = this.jobs.find((j) => j.id === id);
            if (!job)
                throw new Error(`Unknown queue job: ${id}`);
            if (job.status === "done" && job.result !== undefined)
                return job.result;
            if (job.status === "error")
                throw new Error(job.error ?? "Queue job failed");
            await new Promise((r) => setTimeout(r, 25));
        }
        throw new Error(`Queue job timed out: ${id}`);
    }
    async drain() {
        if (this.running)
            return;
        this.running = true;
        try {
            while (true) {
                const next = this.jobs.find((j) => j.status === "queued");
                if (!next)
                    break;
                next.status = "running";
                next.startedAt = Date.now();
                try {
                    next.result = await this.processor(next.label);
                    next.status = "done";
                    this.totalProcessed += 1;
                }
                catch (err) {
                    next.status = "error";
                    next.error = err instanceof Error ? err.message : String(err);
                }
                finally {
                    next.finishedAt = Date.now();
                }
            }
        }
        finally {
            this.running = false;
            if (this.jobs.some((j) => j.status === "queued"))
                void this.drain();
        }
    }
}
//# sourceMappingURL=query-queue.js.map