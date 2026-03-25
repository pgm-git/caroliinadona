/**
 * Serviço de orquestração para petições.
 * Responsável por geração, edição, exportação e validação de petições.
 */

import { db } from "@/server/db/client";
import { petitions } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { renderTemplate } from "@/lib/petition/template-renderer";
import { templateService } from "./template.service";

export interface GeneratePetitionParams {
  caseId: string;
  templateCode: string;
  orgId: string;
  userId: string;
  variables: Record<string, unknown>;
}

export interface UpdatePetitionContentParams {
  petitionId: string;
  contentHtml: string;
  orgId: string;
}

class PetitionService {
  /**
   * Gera uma nova petição para um caso.
   * Renderiza template com variáveis, persiste no DB.
   */
  async generatePetition(params: GeneratePetitionParams) {
    console.log(
      `[petition] Generating petition for case ${params.caseId} with template ${params.templateCode}`
    );

    // 1. Carrega template
    const template = await templateService.getTemplate(params.templateCode);

    // 2. Valida variáveis
    const requiredVarNames = Array.isArray(template.requiredVariables)
      ? (template.requiredVariables as Array<{ name: string }>).map((v) => v.name)
      : [];

    const validation = templateService.validateTemplateVariables(
      params.templateCode,
      params.variables,
      requiredVarNames
    );

    if (!validation.valid) {
      throw new Error(
        `Missing required variables for template ${params.templateCode}: ${validation.missing.join(", ")}`
      );
    }

    // 3. Renderiza template com variáveis
    const renderResult = renderTemplate(
      template.templateBody,
      params.variables,
      validation.missing.length === 0 ? [] : validation.missing
    );

    if (renderResult.missingVariables.length > 0) {
      throw new Error(
        `Template rendering failed. Missing variables: ${renderResult.missingVariables.join(", ")}`
      );
    }

    // 4. Desativa petição anterior (se houver) — similar ao cálculo
    await db
      .update(petitions)
      .set({ status: "draft" })
      .where(
        and(eq(petitions.caseId, params.caseId), eq(petitions.status, "generated"))
      );

    // 5. Obtém próximo version number
    const existing = await db
      .select({ version: petitions.version })
      .from(petitions)
      .where(eq(petitions.caseId, params.caseId))
      .orderBy(petitions.version);

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    // 6. Insere nova petição
    const [inserted] = await db
      .insert(petitions)
      .values({
        orgId: params.orgId,
        caseId: params.caseId,
        templateId: template.id,
        title: template.name,
        petitionType: params.templateCode,
        contentHtml: renderResult.html,
        contentText: this.extractText(renderResult.html),
        variablesUsed: params.variables,
        version: nextVersion,
        status: "generated",
        generatedBy: "ai",
        createdBy: params.userId,
      })
      .returning({ id: petitions.id });

    console.log(`[petition] Petition created: ${inserted.id} (v${nextVersion})`);

    return {
      petitionId: inserted.id,
      version: nextVersion,
      contentHtml: renderResult.html,
      status: "generated",
    };
  }

  /**
   * Obtém a petição atual (última versão "generated") de um caso.
   */
  async getCurrent(caseId: string, orgId: string) {
    const [petition] = await db
      .select()
      .from(petitions)
      .where(
        and(
          eq(petitions.caseId, caseId),
          eq(petitions.orgId, orgId),
          eq(petitions.status, "generated")
        )
      )
      .orderBy(petitions.version)
      .limit(1);

    return petition ?? null;
  }

  /**
   * Obtém histórico de petições para um caso.
   */
  async getHistory(caseId: string, orgId: string) {
    return db
      .select()
      .from(petitions)
      .where(
        and(eq(petitions.caseId, caseId), eq(petitions.orgId, orgId))
      )
      .orderBy(petitions.version);
  }

  /**
   * Atualiza conteúdo HTML de uma petição (edição manual).
   */
  async updateContent(params: UpdatePetitionContentParams) {
    const [updated] = await db
      .update(petitions)
      .set({
        contentHtml: params.contentHtml,
        contentText: this.extractText(params.contentHtml),
        updatedAt: new Date(),
      })
      .where(
        and(eq(petitions.id, params.petitionId), eq(petitions.orgId, params.orgId))
      )
      .returning({ id: petitions.id });

    if (!updated) {
      throw new Error(`Petition ${params.petitionId} not found`);
    }

    return { success: true };
  }

  /**
   * Extrai texto plano de HTML para armazenar searchable text.
   */
  private extractText(html: string): string {
    // Remove tags HTML básicas
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, "")
      .replace(/<script[^>]*>.*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }
}

export const petitionService = new PetitionService();
