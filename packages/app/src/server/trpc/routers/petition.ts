import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { petitionService } from "@/server/services/petition.service";
import { extractVariables } from "@/lib/petition/variable-extractor";
import { db } from "@/server/db/client";
import { petitions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

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

  /**
   * Refina texto de petição com GPT-4o.
   * Adiciona fundamentação jurídica, citações.
   */
  refineWithAI: protectedProcedure
    .input(
      z.object({
        petitionId: z.string().uuid(),
        petitionType: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 1. Busca petição atual
      const petition = await db
        .select()
        .from(petitions)
        .where(eq(petitions.id, input.petitionId))
        .limit(1);

      if (!petition || petition.length === 0) {
        throw new Error(`Petition ${input.petitionId} not found`);
      }

      const current = petition[0];
      const contentHtml = current.contentHtml || "";

      // 2. Refina com GPT-4o
      const { refinedHtml, citations } = await petitionService.refineLegalText(
        contentHtml,
        input.petitionType
      );

      // 3. Atualiza petição com HTML refinado
      await petitionService.updateContent({
        petitionId: input.petitionId,
        contentHtml: refinedHtml,
        orgId: ctx.orgId,
      });

      return {
        success: true,
        refinedHtml,
        citations,
        message: `Petição refinada com ${citations.length} citações adicionadas`,
      };
    }),
});
