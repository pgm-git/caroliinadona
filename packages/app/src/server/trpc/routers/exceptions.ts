import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { exceptionsService } from "@/server/services/exceptions.service";
import { TRPCError } from "@trpc/server";

export const exceptionsRouter = router({
  /**
   * Create a new exception
   */
  create: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        exceptionType: z.string(),
        severity: z.enum(["low", "medium", "high", "critical"]),
        title: z.string().min(3).max(200),
        description: z.string().min(10),
        affectedField: z.string().optional(),
        suggestedAction: z.string().optional(),
        blocksPipeline: z.boolean().default(true),
        pipelineStep: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return exceptionsService.create({
        orgId: ctx.orgId,
        caseId: input.caseId,
        exceptionType: input.exceptionType as any,
        severity: input.severity,
        title: input.title,
        description: input.description,
        affectedField: input.affectedField,
        suggestedAction: input.suggestedAction,
        blocksPipeline: input.blocksPipeline,
        pipelineStep: input.pipelineStep,
        createdBy: ctx.user.id,
      });
    }),

  /**
   * Get open exceptions for organization
   */
  getOpen: protectedProcedure
    .input(
      z.object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(10).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const offset = (input.page - 1) * input.pageSize;
      return exceptionsService.getOpenExceptions(ctx.orgId, input.pageSize, offset);
    }),

  /**
   * Get exceptions for a specific case
   */
  getByCaseId: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input }) => {
      return exceptionsService.getCaseExceptions(input.caseId);
    }),

  /**
   * Get exception by ID
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const exception = await exceptionsService.getById(input.id, ctx.orgId);
      if (!exception) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exceção não encontrada.",
        });
      }
      return exception;
    }),

  /**
   * Resolve an exception
   */
  resolve: protectedProcedure
    .input(
      z.object({
        exceptionId: z.string().uuid(),
        resolution: z.string().min(10),
        resolutionAction: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const exception = await exceptionsService.resolve(
        {
          exceptionId: input.exceptionId,
          resolution: input.resolution,
          resolutionAction: input.resolutionAction,
          resolvedBy: ctx.user.id,
        },
        ctx.orgId
      );

      if (!exception) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exceção não encontrada.",
        });
      }

      return exception;
    }),

  /**
   * Dismiss an exception
   */
  dismiss: protectedProcedure
    .input(z.object({ exceptionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const exception = await exceptionsService.dismiss(
        input.exceptionId,
        ctx.orgId,
        ctx.user.id
      );

      if (!exception) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Exceção não encontrada.",
        });
      }

      return exception;
    }),

  /**
   * Get exception statistics
   */
  getStatistics: protectedProcedure.query(async ({ ctx }) => {
    return exceptionsService.getStatistics(ctx.orgId);
  }),
});
