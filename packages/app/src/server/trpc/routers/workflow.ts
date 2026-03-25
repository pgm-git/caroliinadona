import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { workflowService, WORKFLOW_STATES, STATE_DESCRIPTIONS } from "@/server/services/workflow.service";
import { db } from "@/server/db/client";
import { cases as casesTable } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { DEMO_CASES } from "@/lib/demo-data";

const VALID_STATUSES = [
  "received",
  "analyzing",
  "extraction_complete",
  "validation_pending",
  "validated",
  "calculation_pending",
  "calculated",
  "petition_generating",
  "petition_generated",
  "reviewed",
  "filed",
  "exception",
] as const;

const caseStatusSchema = z.enum(VALID_STATUSES);

export const workflowRouter = router({
  /**
   * Avança o status de um case para o próximo estado válido.
   */
  advanceStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        toStatus: caseStatusSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        return { success: true, newStatus: input.toStatus };
      }

      const [caseData] = await db
        .select()
        .from(casesTable)
        .where(eq(casesTable.id, input.caseId))
        .limit(1);

      if (!caseData) {
        throw new Error(`Case ${input.caseId} not found`);
      }

      await workflowService.advanceStatus({
        caseId: input.caseId,
        fromStatus: caseData.status,
        toStatus: input.toStatus,
        orgId: ctx.orgId,
        userId: ctx.user.id,
      });

      return { success: true, newStatus: input.toStatus };
    }),

  /**
   * Reverte o case para uma etapa anterior com motivo obrigatório.
   */
  revertStatus: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        targetStatus: caseStatusSchema,
        reason: z.string().min(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        return { success: true, newStatus: input.targetStatus };
      }

      await workflowService.revertToStatus(
        input.caseId,
        input.targetStatus,
        ctx.orgId,
        ctx.user.id,
        input.reason
      );

      return { success: true, newStatus: input.targetStatus };
    }),

  /**
   * Obtém os próximos estados válidos a partir do estado atual.
   */
  getNextStates: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        const demoCase = DEMO_CASES.find((c) => c.id === input.caseId);
        const currentStatus = demoCase?.status || "received";
        const nextStates = workflowService.getNextStates(currentStatus);
        return {
          currentStatus,
          nextStates,
          descriptions: Object.fromEntries(
            nextStates.map((status) => [
              status,
              STATE_DESCRIPTIONS[status as keyof typeof STATE_DESCRIPTIONS],
            ])
          ),
        };
      }

      const [caseData] = await db
        .select()
        .from(casesTable)
        .where(eq(casesTable.id, input.caseId))
        .limit(1);

      if (!caseData) {
        throw new Error(`Case ${input.caseId} not found`);
      }

      const nextStates = workflowService.getNextStates(caseData.status);

      return {
        currentStatus: caseData.status,
        nextStates,
        descriptions: Object.fromEntries(
          nextStates.map((status) => [
            status,
            STATE_DESCRIPTIONS[status as keyof typeof STATE_DESCRIPTIONS],
          ])
        ),
      };
    }),

  /**
   * Obtém histórico completo de atividades de um case.
   */
  getCaseHistory: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        return [
          {
            id: "demo-history-1",
            caseId: input.caseId,
            action: "STATUS_CHANGE" as const,
            fromStatus: "received",
            toStatus: "analyzing",
            createdBy: "demo@carolina.app",
            reason: undefined,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: "demo-history-2",
            caseId: input.caseId,
            action: "STATUS_CHANGE" as const,
            fromStatus: "analyzing",
            toStatus: "extraction_complete",
            createdBy: "demo@carolina.app",
            reason: undefined,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        ];
      }
      return workflowService.getCaseHistory(input.caseId, ctx.orgId);
    }),

  /**
   * Obtém estados disponíveis e descrições (para populating UI).
   */
  getStatesEnum: protectedProcedure.query(() => {
    return {
      states: WORKFLOW_STATES,
      descriptions: STATE_DESCRIPTIONS,
    };
  }),
});
