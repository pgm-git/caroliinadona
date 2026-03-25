import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { petitionService } from "@/server/services/petition.service";
import { extractVariables } from "@/lib/petition/variable-extractor";

export const petitionRouter = router({
  /**
   * Gera uma nova petição para um caso.
   */
  generate: protectedProcedure
    .input(
      z.object({
        caseId: z.string().uuid(),
        templateCode: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Extrai variáveis do caso
      const variables = await extractVariables(input.caseId, ctx.orgId);

      // 2. Gera petição (cast para Record<string, unknown> pois ExtractedVariables é um subset conhecido)
      return petitionService.generatePetition({
        caseId: input.caseId,
        templateCode: input.templateCode,
        orgId: ctx.orgId,
        userId: ctx.user.id,
        variables: variables as unknown as Record<string, unknown>,
      });
    }),

  /**
   * Obtém a petição atual (última gerada) de um caso.
   */
  getCurrent: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return petitionService.getCurrent(input.caseId, ctx.orgId);
    }),

  /**
   * Obtém histórico de petições para um caso.
   */
  getHistory: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      return petitionService.getHistory(input.caseId, ctx.orgId);
    }),

  /**
   * Atualiza conteúdo HTML de uma petição (edição manual).
   */
  updateContent: protectedProcedure
    .input(
      z.object({
        petitionId: z.string().uuid(),
        contentHtml: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return petitionService.updateContent({
        petitionId: input.petitionId,
        contentHtml: input.contentHtml,
        orgId: ctx.orgId,
      });
    }),
});
