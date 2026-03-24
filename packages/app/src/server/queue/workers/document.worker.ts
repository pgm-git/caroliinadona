import { Worker, type Job } from "bullmq";
import { getConnectionOptions } from "../connection";
import { QUEUE_NAMES } from "../queues";
import { db } from "@/server/db/client";
import { documents } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { ocrService } from "@/server/services/ocr.service";
import { extractionService } from "@/server/services/extraction.service";
import { partyService } from "@/server/services/party.service";

export interface DocumentProcessingJob {
  documentId: string;
  caseId: string;
  orgId: string;
  action: "ocr" | "classify" | "extract" | "full";
}

let worker: Worker | null = null;

async function processJob(job: Job<DocumentProcessingJob>): Promise<void> {
  const { documentId, caseId, orgId, action } = job.data;

  console.log(
    `[document-processing] Processing job ${job.id}: ${action} for document ${documentId}`
  );

  // Mark processing started
  await db
    .update(documents)
    .set({
      processingStartedAt: new Date(),
      processingError: null,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));

  try {
    if (action === "ocr" || action === "full") {
      await job.updateProgress(10);
      const ocrResult = await ocrService.processOcr(documentId, orgId);
      await job.updateProgress(25);

      if (action === "full") {
        // Classify
        const classification = await extractionService.classifyDocumentType(
          ocrResult.text
        );
        await db
          .update(documents)
          .set({
            aiClassification:
              classification.type as typeof documents.$inferInsert.aiClassification,
            aiConfidence: (classification.confidence / 100).toFixed(4),
            updatedAt: new Date(),
          })
          .where(eq(documents.id, documentId));
        await job.updateProgress(50);

        // Extract
        const extractedId = await extractionService.extractAndPersist(
          documentId,
          caseId,
          orgId,
          ocrResult.text,
          classification.type
        );
        await job.updateProgress(75);

        // Identify parties from the extraction record
        const { extractedData: edTable } = await import("@/server/db/schema");
        const [extRecord] = await db
          .select({ fields: edTable.extractedFields })
          .from(edTable)
          .where(eq(edTable.id, extractedId))
          .limit(1);

        if (extRecord?.fields) {
          await partyService.identifyParties(
            extRecord.fields as Record<string, unknown>,
            caseId,
            orgId
          );
        }
        await job.updateProgress(90);
      }
    }

    if (action === "classify") {
      const [doc] = await db
        .select({ ocrText: documents.ocrText })
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!doc?.ocrText) {
        throw new Error("Texto OCR não disponível. Execute OCR primeiro.");
      }

      const classification = await extractionService.classifyDocumentType(
        doc.ocrText
      );
      await db
        .update(documents)
        .set({
          aiClassification:
            classification.type as typeof documents.$inferInsert.aiClassification,
          aiConfidence: (classification.confidence / 100).toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
    }

    if (action === "extract") {
      const [doc] = await db
        .select({
          ocrText: documents.ocrText,
          documentType: documents.documentType,
        })
        .from(documents)
        .where(eq(documents.id, documentId))
        .limit(1);

      if (!doc?.ocrText) {
        throw new Error("Texto OCR não disponível. Execute OCR primeiro.");
      }

      await extractionService.extractAndPersist(
        documentId,
        caseId,
        orgId,
        doc.ocrText,
        doc.documentType
      );
    }

    // Mark as processed
    await db
      .update(documents)
      .set({
        isProcessed: true,
        processingCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    await job.updateProgress(100);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error(
      `[document-processing] Job ${job.id} error: ${message}`
    );

    await db
      .update(documents)
      .set({
        processingError: message,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    throw error;
  }
}

export function startDocumentWorker(): Worker {
  if (worker) return worker;

  worker = new Worker<DocumentProcessingJob>(
    QUEUE_NAMES.DOCUMENT_PROCESSING,
    processJob,
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
