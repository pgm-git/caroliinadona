import { db } from "@/server/db/client";
import { cases, parties, documents, statusHistory } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export interface ClassificationResult {
  actionType: "execution" | "collection" | "monitoria" | "busca_apreensao";
  actionTypeLabel: string;
  complexity: "simple" | "medium" | "complex";
  complexityLabel: string;
  litisconsortium: {
    detected: boolean;
    type: "necessary" | "optional" | null;
    partyCount: number;
  };
  confidence: number;
  reasoning: string;
}

/** Documento é título executivo extrajudicial? */
const EXEC_TITLE_TYPES = new Set([
  "credit_certificate",
  "promissory_note",
  "check",
  "duplicate",
  "debenture",
]);

export class ClassificationService {
  /**
   * Classify a case's action type, complexity, and litisconsortium.
   */
  async classifyCase(
    caseId: string,
    orgId: string
  ): Promise<ClassificationResult> {
    // Gather data
    const [caseRecord] = await db
      .select()
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.orgId, orgId)))
      .limit(1);

    if (!caseRecord) throw new Error("Caso não encontrado.");

    const caseParties = await db
      .select()
      .from(parties)
      .where(and(eq(parties.caseId, caseId), eq(parties.orgId, orgId)));

    const caseDocs = await db
      .select({ documentType: documents.documentType })
      .from(documents)
      .where(
        and(
          eq(documents.caseId, caseId),
          eq(documents.orgId, orgId),
          isNull(documents.deletedAt)
        )
      );

    // --- Action Type Classification ---
    const docTypes = caseDocs.map((d) => d.documentType);
    const hasExecTitle = docTypes.some((t) => EXEC_TITLE_TYPES.has(t));
    const hasCollateral = docTypes.some((t) => t === "collateral_document");

    let actionType: ClassificationResult["actionType"];
    let actionTypeLabel: string;
    let confidence: number;
    let reasoning: string;

    if (hasCollateral) {
      actionType = "busca_apreensao";
      actionTypeLabel = "Busca e Apreensão";
      confidence = 0.9;
      reasoning =
        "Contrato com alienação fiduciária detectado — DL 911/69";
    } else if (hasExecTitle) {
      actionType = "execution";
      actionTypeLabel = "Execução de Título Extrajudicial";
      confidence = 0.95;
      reasoning =
        "Título executivo extrajudicial presente com liquidez, certeza e exigibilidade";
    } else {
      actionType = "collection";
      actionTypeLabel = "Ação de Cobrança";
      confidence = 0.85;
      reasoning =
        "Ausência de título executivo extrajudicial — via ordinária";
    }

    // --- Complexity Classification ---
    const debtors = caseParties.filter(
      (p) => p.role === "debtor" || p.role === "co_debtor"
    );
    const guarantors = caseParties.filter(
      (p) => p.role === "guarantor" || p.role === "surety"
    );
    const hasGuarantors = guarantors.length > 0;
    const hasMultipleDebtors = debtors.length > 1;

    let complexity: ClassificationResult["complexity"];
    let complexityLabel: string;

    if (hasMultipleDebtors || hasCollateral) {
      complexity = "complex";
      complexityLabel = "Complexo";
    } else if (hasGuarantors) {
      complexity = "medium";
      complexityLabel = "Médio";
    } else {
      complexity = "simple";
      complexityLabel = "Simples";
    }

    // --- Litisconsortium ---
    const totalDefendants = debtors.length + guarantors.length;
    const detected = totalDefendants > 1;
    // Litisconsórcio necessário quando há codevedores solidários
    const litisType = detected
      ? hasMultipleDebtors
        ? ("necessary" as const)
        : ("optional" as const)
      : null;

    return {
      actionType,
      actionTypeLabel,
      complexity,
      complexityLabel,
      litisconsortium: {
        detected,
        type: litisType,
        partyCount: totalDefendants,
      },
      confidence,
      reasoning,
    };
  }

  /**
   * Override the classification manually.
   */
  async overrideClassification(
    caseId: string,
    orgId: string,
    userId: string,
    newCaseType: string,
    justification: string
  ): Promise<void> {
    const [caseRecord] = await db
      .select({ status: cases.status, caseType: cases.caseType })
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.orgId, orgId)))
      .limit(1);

    if (!caseRecord) throw new Error("Caso não encontrado.");

    // Record status change history
    await db.insert(statusHistory).values({
      orgId,
      caseId,
      previousStatus: caseRecord.caseType,
      newStatus: newCaseType,
      changedBy: userId,
      reason: justification,
      metadata: { type: "classification_override" },
    });

    // Update case type
    await db
      .update(cases)
      .set({
        caseType: newCaseType as typeof cases.$inferInsert.caseType,
        metadata: {
          classificationOverride: {
            previousType: caseRecord.caseType,
            newType: newCaseType,
            justification,
            overriddenBy: userId,
            overriddenAt: new Date().toISOString(),
          },
        },
        updatedAt: new Date(),
      })
      .where(eq(cases.id, caseId));
  }
}

export const classificationService = new ClassificationService();
