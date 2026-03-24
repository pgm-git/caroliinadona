import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/client";
import { extractedData, documents, parties } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getQueue, QUEUE_NAMES } from "@/server/queue";

export const extractionRouter = router({
  /**
   * Get the latest extraction for a document.
   */
  getByDocument: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const [extraction] = await db
        .select()
        .from(extractedData)
        .where(
          and(
            eq(extractedData.documentId, input.documentId),
            eq(extractedData.orgId, ctx.orgId)
          )
        )
        .orderBy(desc(extractedData.createdAt))
        .limit(1);

      if (!extraction) return null;

      // Also get the document info
      const [doc] = await db
        .select({
          id: documents.id,
          title: documents.title,
          originalFilename: documents.originalFilename,
          storagePath: documents.storagePath,
          storageBucket: documents.storageBucket,
          mimeType: documents.mimeType,
          documentType: documents.documentType,
          aiClassification: documents.aiClassification,
          aiConfidence: documents.aiConfidence,
          ocrText: documents.ocrText,
          caseId: documents.caseId,
        })
        .from(documents)
        .where(eq(documents.id, input.documentId))
        .limit(1);

      // Get parties for the case
      const caseParties = doc
        ? await db
            .select()
            .from(parties)
            .where(
              and(
                eq(parties.caseId, doc.caseId),
                eq(parties.orgId, ctx.orgId)
              )
            )
        : [];

      return { extraction, document: doc, parties: caseParties };
    }),

  /**
   * Approve an extraction.
   */
  approve: protectedProcedure
    .input(z.object({ extractedDataId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const [updated] = await db
        .update(extractedData)
        .set({
          isApproved: true,
          approvedBy: ctx.user.id,
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(extractedData.id, input.extractedDataId),
            eq(extractedData.orgId, ctx.orgId)
          )
        )
        .returning({ id: extractedData.id });

      if (!updated) {
        throw new Error("Extração não encontrada.");
      }

      return { success: true };
    }),

  /**
   * Update a single extracted field.
   */
  updateField: protectedProcedure
    .input(
      z.object({
        extractedDataId: z.string().uuid(),
        fieldPath: z.string(),
        newValue: z.union([z.string(), z.number(), z.null()]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get current extraction
      const [current] = await db
        .select()
        .from(extractedData)
        .where(
          and(
            eq(extractedData.id, input.extractedDataId),
            eq(extractedData.orgId, ctx.orgId)
          )
        )
        .limit(1);

      if (!current) {
        throw new Error("Extração não encontrada.");
      }

      // Deep update the field in extractedFields
      const fields = current.extractedFields as Record<string, unknown>;
      const parts = input.fieldPath.split(".");

      let target: Record<string, unknown> = fields;
      for (let i = 0; i < parts.length - 1; i++) {
        if (target[parts[i]] && typeof target[parts[i]] === "object") {
          target = target[parts[i]] as Record<string, unknown>;
        }
      }

      const lastKey = parts[parts.length - 1];
      const existing = target[lastKey];

      if (existing && typeof existing === "object") {
        // Update value and confidence, mark as manually edited
        target[lastKey] = {
          ...(existing as Record<string, unknown>),
          value: input.newValue,
          confidence: 100,
          manuallyEdited: true,
        };
      } else {
        target[lastKey] = {
          value: input.newValue,
          confidence: 100,
          manuallyEdited: true,
        };
      }

      await db
        .update(extractedData)
        .set({
          extractedFields: fields,
          updatedAt: new Date(),
        })
        .where(eq(extractedData.id, input.extractedDataId));

      return { success: true };
    }),

  /**
   * Reprocess a document (new extraction, keeps history).
   */
  reprocess: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Get document
      const [doc] = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.id, input.documentId),
            eq(documents.orgId, ctx.orgId)
          )
        )
        .limit(1);

      if (!doc) {
        throw new Error("Documento não encontrado.");
      }

      // Reset document processing state (keep old extractions for history)
      await db
        .update(documents)
        .set({
          isProcessed: false,
          processingStartedAt: null,
          processingCompletedAt: null,
          processingError: null,
          ocrText: null,
          updatedAt: new Date(),
        })
        .where(eq(documents.id, input.documentId));

      // Enqueue full processing
      const queue = getQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);
      await queue.add("process-document", {
        documentId: doc.id,
        caseId: doc.caseId,
        orgId: ctx.orgId,
        action: "full" as const,
      });

      return { success: true };
    }),
});
