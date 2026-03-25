import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { reportsService } from "@/server/services/reports.service";
import { TRPCError } from "@trpc/server";

export const reportsRouter = router({
  /**
   * Generate and download cases CSV
   */
  exportCasesCSV: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        caseType: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) return { content: "", filename: "demo.csv", mimeType: "text/csv" };
      const csv = await reportsService.generateCasesCSV({
        orgId: ctx.orgId,
        status: input.status,
        caseType: input.caseType,
      });

      // Return CSV content and metadata for download
      return {
        content: csv,
        filename: `casos-${new Date().toISOString().split("T")[0]}.csv`,
        mimeType: "text/csv",
      };
    }),

  /**
   * Generate case summary HTML for PDF conversion
   */
  getCaseSummaryHTML: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return null;
      const caseData = await reportsService.getCaseSummary(
        input.caseId,
        ctx.orgId
      );

      if (!caseData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Caso não encontrado.",
        });
      }

      const html = reportsService.generateCaseSummaryHTML(caseData);

      return {
        html,
        filename: `caso-${caseData.internalReference}.html`,
      };
    }),

  /**
   * Get statistics report for organization
   */
  getStatisticsReport: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.isDemo) return null;
    return reportsService.generateStatisticsReport(ctx.orgId);
  }),
});
