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
export declare class QueryQueue<T = unknown> {
    private readonly processor;
    private readonly maxDone;
    private jobs;
    private running;
    private totalProcessed;
    constructor(processor: Processor<T>, maxDone?: number);
    enqueue(label: string): string;
    snapshot(): QueryQueueSnapshot;
    wait(id: string, timeoutMs?: number): Promise<T>;
    private drain;
}
export {};
//# sourceMappingURL=query-queue.d.ts.map