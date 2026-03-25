import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { petitionService } from "@/server/services/petition.service";
import { petitionPdfService } from "@/server/services/petition-pdf.service";
import { petitionDocxService } from "@/server/services/petition-docx.service";
import { petitionValidatorService } from "@/server/services/petition-validator.service";
import { extractVariables } from "@/lib/petition/variable-extractor";
import { db } from "@/server/db/client";
import { petitions } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const petitionRouter = router({
  generate: protectedProcedure
    .input(z.object({ caseId: z.string().uuid(), templateCode: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.isDemo) {
        return { id: crypto.randomUUID(), caseId: input.caseId, contentHtml: "<p>Peticao demo gerada</p>", version: 1 };
      }
      const variables = await extractVariables(input.caseId, ctx.orgId);
      return petitionService.generatePetition({
        caseId: input.caseId, templateCode: input.templateCode,
        orgId: ctx.orgId, userId: ctx.user.id,
        variables: variables as unknown as Record<string, unknown>,
      });
    }),

  getCurrent: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return null;
      return petitionService.getCurrent(input.caseId, ctx.orgId);
    }),

  getHistory: protectedProcedure
    .input(z.object({ caseId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      if (ctx.isDemo) return [];
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

  /**
   * Obtém HTML formatado para PDF (print-ready)
   */
  getPdfHtml: protectedProcedure
    .input(z.object({ petitionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const petition = await db
        .select()
        .from(petitions)
        .where(eq(petitions.id, input.petitionId))
        .limit(1);

      if (!petition || petition.length === 0) {
        throw new Error("Petição não encontrada");
      }

      const contentHtml = petition[0].contentHtml || "";
      const pdfHtml = petitionPdfService.formatHtmlForPdf(contentHtml);

      return {
        html: pdfHtml,
        filename: petitionPdfService.generateFilename(
          petition[0].id,
          petition[0].version
        ),
      };
    }),

  /**
   * Exporta petição como HTML para download (usuário faz print-to-PDF no navegador)
   */
  exportAsHtml: protectedProcedure
    .input(z.object({ petitionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const petition = await db
        .select()
        .from(petitions)
        .where(eq(petitions.id, input.petitionId))
        .limit(1);

      if (!petition || petition.length === 0) {
        throw new Error("Petição não encontrada");
      }

      const contentHtml = petition[0].contentHtml || "";
      const pdfHtml = petitionPdfService.formatHtmlForPdf(contentHtml);

      return {
        content: pdfHtml,
        filename: petitionPdfService.generateFilename(
          petition[0].id,
          petition[0].version
        ),
        mimeType: "text/html",
      };
    }),

  /**
   * Exporta petição como DOCX (Word editável)
   */
  exportAsDocx: protectedProcedure
    .input(z.object({ petitionId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const petition = await db
        .select()
        .from(petitions)
        .where(eq(petitions.id, input.petitionId))
        .limit(1);

      if (!petition || petition.length === 0) {
        throw new Error("Petição não encontrada");
      }

      const contentHtml = petition[0].contentHtml || "";
      const docxContent = petitionDocxService.generateDocxContent(
        contentHtml,
        `Petição - ${petition[0].id}`
      );

      // Return only document.xml (simplified DOCX without ZIP compression)
      // In production, this would be a proper ZIP file
      return {
        content: docxContent.document,
        filename: petitionDocxService.generateFilename(
          petition[0].id,
          petition[0].version
        ),
        mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      };
    }),

  /**
   * Valida petição antes de exportação
   */
  validate: protectedProcedure
    .input(z.object({ petitionId: z.string().uuid() }))
    .query(async ({ input, ctx }) => {
      const petition = await db
        .select()
        .from(petitions)
        .where(eq(petitions.id, input.petitionId))
        .limit(1);

      if (!petition || petition.length === 0) {
        throw new Error("Petição não encontrada");
      }

      const contentHtml = petition[0].contentHtml || "";
      const contentText = petition[0].contentText || "";

      const validation = petitionValidatorService.validatePetition(
        contentHtml,
        contentText
      );

      const summary = petitionValidatorService.getValidationSummary(validation);

      return {
        ...validation,
        ...summary,
      };
    }),
});
