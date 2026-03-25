/**
 * Serviço de gerenciamento de templates de petição.
 * Responsável por seed, loading e validação de templates.
 */

import { db } from "@/server/db/client";
import { petitionTemplates } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { extractPlaceholders, validateVariables } from "@/lib/petition/template-renderer";
import { readFileSync } from "fs";
import { join } from "path";

// Carrega templates do filesystem em tempo de execução
function loadTemplateFile(filename: string): string {
  const path = join(process.cwd(), "packages/app/src/lib/petition/templates", filename);
  return readFileSync(path, "utf-8");
}

export interface TemplateDefinition {
  name: string;
  description: string;
  templateCode: string;
  caseType: "execution" | "collection";
  templateBody: string;
  courtState?: string;
  tribunalAcronym?: string;
}

function getSystemTemplates(): TemplateDefinition[] {
  return [
    {
      name: "Execução de CCB",
      description: "Template para execução de Cédula de Crédito Bancária",
      templateCode: "EXECUTION_CCB",
      caseType: "execution",
      templateBody: loadTemplateFile("execution-ccb.html"),
      courtState: "SP",
      tribunalAcronym: "TJSP",
    },
    {
      name: "Ação de Cobrança",
      description: "Template para ação ordinária de cobrança",
      templateCode: "COLLECTION",
      caseType: "collection",
      templateBody: loadTemplateFile("collection.html"),
      courtState: "SP",
      tribunalAcronym: "TJSP",
    },
    {
      name: "Ação Monitória",
      description: "Template para ação monitória com mandado de pagamento",
      templateCode: "MONITORY",
      caseType: "collection",
      templateBody: loadTemplateFile("monitory.html"),
      courtState: "SP",
      tribunalAcronym: "TJSP",
    },
  ];
}

class TemplateService {
  /**
   * Seed de templates do sistema no banco de dados.
   * Deve ser executada uma única vez ao inicializar o sistema.
   */
  async seedSystemTemplates(orgId: string): Promise<void> {
    console.log(`[template] Seeding system templates for org ${orgId}...`);

    const SYSTEM_TEMPLATES = getSystemTemplates();
    for (const template of SYSTEM_TEMPLATES) {
      // Valida que o template tem placeholders válidos
      const placeholders = extractPlaceholders(template.templateBody);
      console.log(
        `[template] Template ${template.templateCode} contains ${placeholders.length} placeholders: ${placeholders.join(", ")}`
      );

      // Verifica se template já existe
      const existing = await db
        .select()
        .from(petitionTemplates)
        .where(
          and(
            eq(petitionTemplates.orgId, orgId),
            eq(petitionTemplates.templateCode, template.templateCode)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        console.log(`[template] Template ${template.templateCode} already exists, skipping`);
        continue;
      }

      // Insere template
      await db.insert(petitionTemplates).values({
        orgId,
        name: template.name,
        description: template.description,
        templateCode: template.templateCode,
        caseType: template.caseType,
        templateBody: template.templateBody,
        templateFormat: "html",
        requiredVariables: this.extractRequiredVariables(placeholders),
        applicableDocumentTypes: [],
        courtState: template.courtState,
        tribunalAcronym: template.tribunalAcronym,
        isActive: true,
        isSystem: true,
        version: 1,
      });

      console.log(`[template] Template ${template.templateCode} seeded successfully`);
    }
  }

  /**
   * Carrega template do banco de dados pelo código.
   */
  async getTemplate(templateCode: string) {
    const template = await db
      .select()
      .from(petitionTemplates)
      .where(
        and(
          eq(petitionTemplates.templateCode, templateCode),
          eq(petitionTemplates.isActive, true)
        )
      )
      .limit(1);

    if (template.length === 0) {
      throw new Error(`Template ${templateCode} not found`);
    }

    return template[0];
  }

  /**
   * Lista todos os templates ativos para um tipo de caso.
   */
  async getTemplatesByType(caseType: "execution" | "collection") {
    return db
      .select()
      .from(petitionTemplates)
      .where(
        and(
          eq(petitionTemplates.caseType, caseType),
          eq(petitionTemplates.isActive, true)
        )
      );
  }

  /**
   * Valida que todas as variáveis obrigatórias estão presentes.
   */
  validateTemplateVariables(
    templateCode: string,
    variables: Record<string, unknown>,
    requiredVariables: string[]
  ): { valid: boolean; missing: string[] } {
    const missing = validateVariables(variables, requiredVariables);

    return {
      valid: missing.length === 0,
      missing,
    };
  }

  /**
   * Extrai variáveis obrigatórias de uma lista de placeholders.
   * Por enquanto, todas as variáveis encontradas são consideradas obrigatórias.
   * Pode ser expandido para suportar sintaxe como {{variable?}} para opcionais.
   */
  private extractRequiredVariables(placeholders: string[]): unknown[] {
    return placeholders.map((name) => ({
      name,
      required: true,
      description: `Variável ${name}`,
    }));
  }
}

export const templateService = new TemplateService();
