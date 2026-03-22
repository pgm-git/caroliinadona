import { Worker, type Job } from "bullmq";
import { getConnectionOptions } from "../connection";
import { QUEUE_NAMES } from "../queues";

export interface DocumentProcessingJob {
  documentId: string;
  caseId: string;
  orgId: string;
  action: "ocr" | "classify" | "extract";
}

let worker: Worker | null = null;

export function startDocumentWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<DocumentProcessingJob>(
    QUEUE_NAMES.DOCUMENT_PROCESSING,
    async (job: Job<DocumentProcessingJob>) => {
      console.log(
        `[document-processing] Processing job ${job.id}: ${job.data.action} for document ${job.data.documentId}`
      );
      // TODO: Implementar processamento real (OCR, classificação, extração)
    },
    {
      connection: getConnectionOptions(),
      concurrency: 2,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[document-processing] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[document-processing] Job ${job?.id} failed: ${err.message}`
    );
  });

  return worker;
}

export async function stopDocumentWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
