import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { storageService } from "@/server/services/storage.service";
import { db } from "@/server/db/client";
import { documents } from "@/server/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export const documentsRouter = router({
  /**
   * Get a signed URL for downloading a document.
   */
  getSignedUrl: protectedProcedure
    .input(z.object({ storagePath: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return { url: "" };
      const url = await storageService.getSignedUrl(input.storagePath);
      return { url };
    }),

  /**
   * List documents for a case.
   */
  listByCase: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return [];
      const docs = await db
        .select()
        .from(documents)
        .where(
          and(
            eq(documents.caseId, input.caseId),
            eq(documents.orgId, ctx.orgId),
            isNull(documents.deletedAt)
          )
        )
        .orderBy(desc(documents.createdAt));

      return docs;
    }),

  /**
   * Soft delete a document.
   */
  delete: protectedProcedure
    .input(z.object({ documentId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) return { success: true };
      await storageService.deleteDocument(input.documentId, ctx.orgId);
      return { success: true };
    }),
});
