import { Worker, type Job } from "bullmq";
import { getConnectionOptions } from "../connection";
import { QUEUE_NAMES } from "../queues";

export interface BatchImportJob {
  orgId: string;
  fileUrl: string;
  importType: "cases" | "parties" | "documents";
  totalRecords: number;
}

let worker: Worker | null = null;

export function startBatchWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<BatchImportJob>(
    QUEUE_NAMES.BATCH_IMPORT,
    async (job: Job<BatchImportJob>) => {
      console.log(
        `[batch-import] Processing job ${job.id}: importing ${job.data.totalRecords} ${job.data.importType}`
      );
      // TODO: Implementar importação em batch
    },
    {
      connection: getConnectionOptions(),
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[batch-import] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[batch-import] Job ${job?.id} failed: ${err.message}`);
  });

  return worker;
}

export async function stopBatchWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
