import { getQueue, QUEUE_NAMES } from "./queues";

export interface QueueHealthStatus {
  redis: "connected" | "error";
  latencyMs: number | null;
  error?: string;
}

export async function checkQueueHealth(): Promise<QueueHealthStatus> {
  try {
    const queue = getQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);
    const start = Date.now();
    // getJobCounts faz uma chamada ao Redis, servindo como health check
    await queue.getJobCounts();
    const latencyMs = Date.now() - start;

    return {
      redis: "connected",
      latencyMs,
    };
  } catch (error) {
    return {
      redis: "error",
      latencyMs: null,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
