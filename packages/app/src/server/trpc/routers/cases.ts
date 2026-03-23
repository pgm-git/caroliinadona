import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { casesService } from "@/server/services/cases.service";
import { TRPCError } from "@trpc/server";

export const casesRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(200),
        caseType: z.enum(["execution", "collection"]),
        description: z.string().optional(),
        courtId: z.string().uuid().optional(),
        priority: z.number().int().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const newCase = await casesService.create({
        orgId: ctx.orgId,
        title: input.title,
        caseType: input.caseType,
        description: input.description,
        courtId: input.courtId,
        priority: input.priority,
        createdBy: ctx.user.id,
      });

      return newCase;
    }),

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(10).max(50).default(20),
        search: z.string().optional(),
        status: z.string().optional(),
        caseType: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "updatedAt", "priority"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ input, ctx }) => {
      return casesService.list({
        orgId: ctx.orgId,
        ...input,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const result = await casesService.getById(input.id, ctx.orgId);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Caso não encontrado.",
        });
      }
      return result;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        title: z.string().min(3).max(200).optional(),
        description: z.string().optional(),
        priority: z.number().int().min(1).max(5).optional(),
        courtId: z.string().uuid().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const updated = await casesService.update(id, ctx.orgId, data);
      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Caso não encontrado.",
        });
      }
      return updated;
    }),

  /**
   * Enqueue document processing for documents already uploaded.
   */
  enqueueProcessing: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        documentIds: z.array(z.string().uuid()),
        priority: z.number().int().min(1).max(5).default(3),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await casesService.enqueueDocumentProcessing(
        input.caseId,
        ctx.orgId,
        input.documentIds,
        input.priority
      );
      return { enqueued: input.documentIds.length };
    }),
});
