import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/client";
import { documents, cases } from "@/server/db/schema";
import { eq, and, isNull, isNotNull, desc, count, sql } from "drizzle-orm";
import { getQueue, QUEUE_NAMES } from "@/server/queue";

export const queueRouter = router({
  /**
   * List documents in the processing queue with filters and pagination.
   */
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(10).max(50).default(20),
        status: z
          .enum(["all", "pending", "processing", "completed", "error"])
          .default("all"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, ctx }) => {
      const conditions = [
        eq(documents.orgId, ctx.orgId),
        isNull(documents.deletedAt),
      ];

      // Map UI status to DB conditions
      switch (input.status) {
        case "pending":
          conditions.push(eq(documents.isProcessed, false));
          conditions.push(isNull(documents.processingStartedAt));
          conditions.push(isNull(documents.processingError));
          break;
        case "processing":
          conditions.push(eq(documents.isProcessed, false));
          conditions.push(isNotNull(documents.processingStartedAt));
          conditions.push(isNull(documents.processingError));
          break;
        case "completed":
          conditions.push(eq(documents.isProcessed, true));
          conditions.push(isNull(documents.processingError));
          break;
        case "error":
          conditions.push(isNotNull(documents.processingError));
          break;
      }

      const [totalResult] = await db
        .select({ value: count() })
        .from(documents)
        .where(and(...conditions));

      const total = Number(totalResult.value);

      const orderFn =
        input.sortOrder === "asc"
          ? sql`${documents.createdAt} ASC`
          : desc(documents.createdAt);

      const items = await db
        .select({
          id: documents.id,
          title: documents.title,
          originalFilename: documents.originalFilename,
          mimeType: documents.mimeType,
          fileSizeBytes: documents.fileSizeBytes,
          documentType: documents.documentType,
          isProcessed: documents.isProcessed,
          processingStartedAt: documents.processingStartedAt,
          processingCompletedAt: documents.processingCompletedAt,
          processingError: documents.processingError,
          createdAt: documents.createdAt,
          caseId: documents.caseId,
          caseReference: cases.internalReference,
        })
        .from(documents)
        .leftJoin(cases, eq(documents.caseId, cases.id))
        .where(and(...conditions))
        .orderBy(orderFn)
        .limit(input.pageSize)
        .offset((input.page - 1) * input.pageSize);

      return {
        items,
        total,
        page: input.page,
        pageSize: input.pageSize,
        totalPages: Math.ceil(total / input.pageSize),
      };
    }),

  /**
   * Get document count summary by status.
   */
  summary: protectedProcedure.query(async ({ ctx }) => {
    const baseCondition = and(
      eq(documents.orgId, ctx.orgId),
      isNull(documents.deletedAt)
    );

    const [totalResult] = await db
      .select({ value: count() })
      .from(documents)
      .where(baseCondition);

    const [completedResult] = await db
      .select({ value: count() })
      .from(documents)
      .where(
        and(baseCondition, eq(documents.isProcessed, true), isNull(documents.processingError))
      );

    const [errorResult] = await db
      .select({ value: count() })
      .from(documents)
      .where(and(baseCondition, isNotNull(documents.processingError)));

    const [processingResult] = await db
      .select({ value: count() })
      .from(documents)
      .where(
        and(
          baseCondition,
          eq(documents.isProcessed, false),
          isNotNull(documents.processingStartedAt),
          isNull(documents.processingError)
        )
      );

    const total = Number(totalResult.value);
    const completed = Number(completedResult.value);
    const errors = Number(errorResult.value);
    const processing = Number(processingResult.value);
    const pending = total - completed - errors - processing;

    return { total, pending, processing, completed, errors };
  }),

  /**
   * Reprocess a document that failed.
   */
  reprocess: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      // Reset processing state
      const [doc] = await db
        .update(documents)
        .set({
          isProcessed: false,
          processingStartedAt: null,
          processingCompletedAt: null,
          processingError: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(documents.id, input.documentId),
            eq(documents.orgId, ctx.orgId)
          )
        )
        .returning();

      if (!doc) {
        throw new Error("Documento não encontrado.");
      }

      // Re-enqueue
      const queue = getQueue(QUEUE_NAMES.DOCUMENT_PROCESSING);
      await queue.add("process-document", {
        documentId: doc.id,
        caseId: doc.caseId,
        orgId: ctx.orgId,
        action: "ocr" as const,
      });

      return { success: true };
    }),
});
