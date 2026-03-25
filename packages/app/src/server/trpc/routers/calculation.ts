import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { calculationService } from "@/server/services/calculation.service";

export const calculationRouter = router({
  /**
   * Execute a full calculation for a case.
   */
  calculate: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        principalAmount: z.number().positive(),
        contractDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        defaultDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        calculationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        correctionIndex: z.enum([
          "igpm",
          "ipca",
          "inpc",
          "selic",
          "cdi",
          "tr",
          "tjlp",
          "custom",
        ]),
        interestRateMonthly: z.number().min(0).max(100),
        interestType: z.enum(["simple", "compound"]),
        penaltyRate: z.number().min(0).max(100),
        attorneyFeesRate: z.number().min(0).max(100),
        courtCosts: z.number().min(0).optional(),
        otherCharges: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return calculationService.calculateCase({
        ...input,
        orgId: ctx.orgId,
        userId: ctx.user.id,
      });
    }),

  /**
   * Get the current (latest) calculation for a case.
   */
  getCurrent: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return calculationService.getCurrentCalculation(input.caseId, ctx.orgId);
    }),

  /**
   * Get all calculation versions for a case.
   */
  getHistory: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return calculationService.getCalculationHistory(input.caseId, ctx.orgId);
    }),

  /**
   * Validate (approve) a calculation.
   */
  validate: protectedProcedure
    .input(
      z.object({
        calculationId: z.string().uuid(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await calculationService.validateCalculation(
        input.calculationId,
        ctx.orgId,
        ctx.user.id,
        input.notes
      );
      return { success: true };
    }),
});
