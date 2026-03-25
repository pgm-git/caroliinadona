import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { classificationService } from "@/server/services/classification.service";

export const classificationRouter = router({
  /**
   * Classify a case (action type, complexity, litisconsortium).
   */
  classify: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const result = await classificationService.classifyCase(
        input.caseId,
        ctx.orgId
      );
      return result;
    }),

  /**
   * Override classification manually with justification.
   */
  override: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        newCaseType: z.enum(["execution", "collection"]),
        justification: z
          .string()
          .min(10, "Justificativa deve ter pelo menos 10 caracteres"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await classificationService.overrideClassification(
        input.caseId,
        ctx.orgId,
        ctx.user.id,
        input.newCaseType,
        input.justification
      );
      return { success: true };
    }),
});
