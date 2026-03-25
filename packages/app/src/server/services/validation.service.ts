import { db } from "@/server/db/client";
import {
  validations,
  cases,
  parties,
  documents,
  extractedData,
} from "@/server/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";
import {
  runValidation,
  type CaseValidationData,
  type ValidationIssue,
} from "@/lib/validation/rules";

export class ValidationService {
  /**
   * Run all validation rules for a case and persist results.
   */
  async validateCase(
    caseId: string,
    orgId: string
  ): Promise<ValidationIssue[]> {
    // Gather case data
    const data = await this.gatherCaseData(caseId, orgId);

    // Run rules
    const issues = runValidation(data);

    // Clear previous validations for this case
    await db
      .delete(validations)
      .where(
        and(eq(validations.caseId, caseId), eq(validations.orgId, orgId))
      );

    // Persist new validations
    if (issues.length > 0) {
      await db.insert(validations).values(
        issues.map((issue) => ({
          orgId,
          caseId,
          ruleCode: issue.ruleCode,
          ruleName: issue.ruleName,
          ruleCategory: issue.ruleCategory,
          ruleDescription: issue.ruleDescription,
          status: issue.status as typeof validations.$inferInsert.status,
          severity: issue.severity as typeof validations.$inferInsert.severity,
          fieldName: issue.fieldName,
          expectedValue: issue.expectedValue,
          actualValue: issue.actualValue,
          message: issue.message,
        }))
      );
    }

    // Also insert "passed" records for rules that didn't trigger
    console.log(
      `[validation] Case ${caseId}: ${issues.length} issues found`
    );

    return issues;
  }

  /**
   * Gather all necessary data for validation.
   */
  private async gatherCaseData(
    caseId: string,
    orgId: string
  ): Promise<CaseValidationData> {
    const [caseRecord] = await db
      .select()
      .from(cases)
      .where(and(eq(cases.id, caseId), eq(cases.orgId, orgId)))
      .limit(1);

    if (!caseRecord) {
      throw new Error("Caso não encontrado.");
    }

    const caseParties = await db
      .select()
      .from(parties)
      .where(and(eq(parties.caseId, caseId), eq(parties.orgId, orgId)));

    const caseDocs = await db
      .select({
        documentType: documents.documentType,
        isProcessed: documents.isProcessed,
      })
      .from(documents)
      .where(
        and(
          eq(documents.caseId, caseId),
          eq(documents.orgId, orgId),
          isNull(documents.deletedAt)
        )
      );

    // Get latest extraction
    const [latestExtraction] = await db
      .select({ extractedFields: extractedData.extractedFields })
      .from(extractedData)
      .where(
        and(
          eq(extractedData.caseId, caseId),
          eq(extractedData.orgId, orgId)
        )
      )
      .orderBy(desc(extractedData.createdAt))
      .limit(1);

    // Determine primary document type
    const primaryDocType = caseDocs.length > 0 ? caseDocs[0].documentType : null;

    return {
      caseId,
      caseType: caseRecord.caseType,
      dueDate: caseRecord.dueDate,
      principalAmount: caseRecord.principalAmount,
      contractNumber: caseRecord.contractNumber,
      documentType: primaryDocType,
      parties: caseParties.map((p) => ({
        role: p.role,
        cpf: p.cpf,
        cnpj: p.cnpj,
        fullName: p.fullName,
        addressStreet: p.addressStreet,
      })),
      documents: caseDocs.map((d) => ({
        documentType: d.documentType,
        isProcessed: d.isProcessed,
      })),
      extractedFields: (latestExtraction?.extractedFields as Record<
        string,
        unknown
      >) ?? null,
    };
  }

  /**
   * Resolve a validation issue manually.
   */
  async resolveValidation(
    validationId: string,
    orgId: string,
    userId: string,
    notes: string
  ): Promise<void> {
    const [updated] = await db
      .update(validations)
      .set({
        status: "passed",
        resolvedBy: userId,
        resolvedAt: new Date(),
        resolutionNotes: notes,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(validations.id, validationId),
          eq(validations.orgId, orgId)
        )
      )
      .returning({ id: validations.id });

    if (!updated) {
      throw new Error("Validação não encontrada.");
    }
  }
}

export const validationService = new ValidationService();
