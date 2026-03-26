import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { calculationService } from "@/server/services/calculation.service";
import { getDemoCaseCalculation, getDemoCaseCalculationHistory } from "@/lib/demo-data";

export const calculationRouter = router({
  calculate: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        principalAmount: z.number().positive(),
        contractDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        defaultDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        calculationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        correctionIndex: z.enum(["igpm", "ipca", "inpc", "selic", "cdi", "tr", "tjlp", "custom"]),
        interestRateMonthly: z.number().min(0).max(100),
        interestType: z.enum(["simple", "compound"]),
        penaltyRate: z.number().min(0).max(100),
        attorneyFeesRate: z.number().min(0).max(100),
        courtCosts: z.number().min(0).optional(),
        otherCharges: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        return {
          calculationId: crypto.randomUUID(),
          version: 1,
          summary: {
            principalAmount: input.principalAmount,
            correctedAmount: input.principalAmount * 1.12,
            correctionDifference: input.principalAmount * 0.12,
            interestAmount: input.principalAmount * 0.08,
            penaltyAmount: input.principalAmount * (input.penaltyRate / 100),
            attorneyFeesAmount: input.principalAmount * (input.attorneyFeesRate / 100),
            courtCosts: input.courtCosts ?? 0,
            otherCharges: input.otherCharges ?? 0,
            totalAmount: input.principalAmount * 1.35,
          },
          warnings: [],
          correctionDetails: [],
          interestDetails: [],
        } as any;
      }
      return calculationService.calculateCase({ ...input, orgId: ctx.orgId, userId: ctx.user.id });
    }),

  getCurrent: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return getDemoCaseCalculation(input.caseId);
      return calculationService.getCurrentCalculation(input.caseId, ctx.orgId);
    }),

  getHistory: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return getDemoCaseCalculationHistory(input.caseId);
      return calculationService.getCalculationHistory(input.caseId, ctx.orgId);
    }),

  validate: protectedProcedure
    .input(z.object({ calculationId: z.string().uuid(), notes: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) return { success: true };
      await calculationService.validateCalculation(input.calculationId, ctx.orgId, ctx.user.id, input.notes);
      return { success: true };
    }),
});
