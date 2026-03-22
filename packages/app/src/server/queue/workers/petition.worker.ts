import { Worker, type Job } from "bullmq";
import { getConnectionOptions } from "../connection";
import { QUEUE_NAMES } from "../queues";

export interface PetitionGenerationJob {
  caseId: string;
  orgId: string;
  templateId: string;
  calculationId: string;
}

let worker: Worker | null = null;

export function startPetitionWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<PetitionGenerationJob>(
    QUEUE_NAMES.PETITION_GENERATION,
    async (job: Job<PetitionGenerationJob>) => {
      console.log(
        `[petition-generation] Processing job ${job.id}: generating petition for case ${job.data.caseId}`
      );
      // TODO: Implementar geração real de petição (IA + template)
    },
    {
      connection: getConnectionOptions(),
      concurrency: 1,
    }
  );

  worker.on("completed", (job) => {
    console.log(`[petition-generation] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(
      `[petition-generation] Job ${job?.id} failed: ${err.message}`
    );
  });

  return worker;
}

export async function stopPetitionWorker(): Promise<void> {
  if (worker) {
    await worker.close();
    worker = null;
  }
}
