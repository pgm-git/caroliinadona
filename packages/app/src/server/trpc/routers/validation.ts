import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { db } from "@/server/db/client";
import { validations } from "@/server/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { validationService } from "@/server/services/validation.service";

export const validationRouter = router({
  /**
   * Run all validation rules for a case.
   */
  runValidation: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const issues = await validationService.validateCase(
        input.caseId,
        ctx.orgId
      );
      return { issues, count: issues.length };
    }),

  /**
   * List validations for a case.
   */
  listByCase: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const items = await db
        .select()
        .from(validations)
        .where(
          and(
            eq(validations.caseId, input.caseId),
            eq(validations.orgId, ctx.orgId)
          )
        )
        .orderBy(desc(validations.createdAt));

      const blocking = items.filter(
        (v) =>
          v.status === "failed" &&
          (v.severity === "critical" || v.severity === "high")
      );
      const warnings = items.filter((v) => v.status === "warning");
      const passed = items.filter((v) => v.status === "passed");

      return {
        items,
        summary: {
          total: items.length,
          blocking: blocking.length,
          warnings: warnings.length,
          passed: passed.length,
          hasBlockingIssues: blocking.length > 0,
        },
      };
    }),

  /**
   * Resolve a validation manually.
   */
  resolve: protectedProcedure
    .input(
      z.object({
        validationId: z.string().uuid(),
        notes: z.string().min(5, "Justificativa deve ter pelo menos 5 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await validationService.resolveValidation(
        input.validationId,
        ctx.orgId,
        ctx.user.id,
        input.notes
      );
      return { success: true };
    }),
});
