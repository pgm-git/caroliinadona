import { Queue } from "bullmq";
import { getConnectionOptions } from "./connection";

export const QUEUE_NAMES = {
  DOCUMENT_PROCESSING: "document-processing",
  PETITION_GENERATION: "petition-generation",
  BATCH_IMPORT: "batch-import",
  INDEX_SYNC: "index-sync",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

const defaultJobOptions = {
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
};

let queues: Map<QueueName, Queue> | null = null;

function createQueues(): Map<QueueName, Queue> {
  const connection = getConnectionOptions();
  const map = new Map<QueueName, Queue>();

  map.set(
    QUEUE_NAMES.DOCUMENT_PROCESSING,
    new Queue(QUEUE_NAMES.DOCUMENT_PROCESSING, {
      connection,
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        priority: 1,
      },
    })
  );

  map.set(
    QUEUE_NAMES.PETITION_GENERATION,
    new Queue(QUEUE_NAMES.PETITION_GENERATION, {
      connection,
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 2,
        backoff: { type: "exponential", delay: 10000 },
        priority: 5,
      },
    })
  );

  map.set(
    QUEUE_NAMES.BATCH_IMPORT,
    new Queue(QUEUE_NAMES.BATCH_IMPORT, {
      connection,
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 1,
        priority: 10,
      },
    })
  );

  map.set(
    QUEUE_NAMES.INDEX_SYNC,
    new Queue(QUEUE_NAMES.INDEX_SYNC, {
      connection,
      defaultJobOptions: {
        ...defaultJobOptions,
        attempts: 2,
        backoff: { type: "exponential", delay: 30000 },
      },
    })
  );

  return map;
}

export function getQueues(): Map<QueueName, Queue> {
  if (!queues) {
    queues = createQueues();
  }
  return queues;
}

export function getQueue(name: QueueName): Queue {
  const q = getQueues().get(name);
  if (!q) throw new Error(`Queue ${name} not found`);
  return q;
}

export async function closeQueues(): Promise<void> {
  if (queues) {
    await Promise.all(Array.from(queues.values()).map((q) => q.close()));
    queues = null;
  }
}
