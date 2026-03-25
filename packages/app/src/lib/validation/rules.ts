/**
 * Validation rules engine for case data validation.
 */
import { isValidCpfCnpj } from "./cpf-cnpj";
import { calculatePrescription } from "./prescription";

export type Severity = "critical" | "high" | "medium" | "low";
export type ValidationStatus = "pending" | "passed" | "failed" | "warning";

export interface ValidationIssue {
  ruleCode: string;
  ruleName: string;
  ruleCategory: string;
  ruleDescription: string;
  severity: Severity;
  status: ValidationStatus;
  fieldName: string | null;
  expectedValue: string | null;
  actualValue: string | null;
  message: string;
}

export interface CaseValidationData {
  caseId: string;
  caseType: string;
  dueDate: string | null;
  principalAmount: string | null;
  contractNumber: string | null;
  documentType: string | null; // primary document type
  parties: Array<{
    role: string;
    cpf: string | null;
    cnpj: string | null;
    fullName: string;
    addressStreet: string | null;
  }>;
  documents: Array<{
    documentType: string;
    isProcessed: boolean;
  }>;
  extractedFields: Record<string, unknown> | null;
}

type ValidationRule = (data: CaseValidationData) => ValidationIssue | null;

/**
 * All validation rules for a case.
 */
export const VALIDATION_RULES: ValidationRule[] = [
  // --- Completude ---

  function devedorRequired(data) {
    const debtors = data.parties.filter(
      (p) => p.role === "debtor" || p.role === "DEVEDOR"
    );
    if (debtors.length === 0) {
      return {
        ruleCode: "DEVEDOR_REQUIRED",
        ruleName: "Devedor obrigatório",
        ruleCategory: "completude",
        ruleDescription: "O caso deve ter pelo menos um devedor identificado",
        severity: "critical",
        status: "failed",
        fieldName: "parties",
        expectedValue: ">=1 devedor",
        actualValue: "0",
        message: "Nenhum devedor identificado no caso.",
      };
    }
    return null;
  },

  function devedorCpfCnpjRequired(data) {
    const debtors = data.parties.filter(
      (p) => p.role === "debtor" || p.role === "DEVEDOR"
    );
    for (const d of debtors) {
      const doc = d.cpf || d.cnpj;
      if (!doc) {
        return {
          ruleCode: "DEVEDOR_CPF_REQUIRED",
          ruleName: "CPF/CNPJ do devedor",
          ruleCategory: "completude",
          ruleDescription: "Devedor deve ter CPF ou CNPJ",
          severity: "critical",
          status: "failed",
          fieldName: "party.cpfCnpj",
          expectedValue: "CPF ou CNPJ válido",
          actualValue: "ausente",
          message: `Devedor "${d.fullName}" não possui CPF/CNPJ.`,
        };
      }
    }
    return null;
  },

  function valorPrincipalRequired(data) {
    if (!data.principalAmount || Number(data.principalAmount) <= 0) {
      return {
        ruleCode: "VALOR_PRINCIPAL_REQUIRED",
        ruleName: "Valor principal obrigatório",
        ruleCategory: "completude",
        ruleDescription: "Valor principal da dívida deve estar presente",
        severity: "critical",
        status: "failed",
        fieldName: "principalAmount",
        expectedValue: "> 0",
        actualValue: data.principalAmount ?? "null",
        message: "Valor principal da dívida não identificado.",
      };
    }
    return null;
  },

  function dataVencimentoRequired(data) {
    if (!data.dueDate) {
      return {
        ruleCode: "DATA_VENCIMENTO_REQUIRED",
        ruleName: "Data de vencimento obrigatória",
        ruleCategory: "completude",
        ruleDescription: "Data de vencimento deve estar presente",
        severity: "high",
        status: "failed",
        fieldName: "dueDate",
        expectedValue: "data válida",
        actualValue: "null",
        message: "Data de vencimento não identificada.",
      };
    }
    return null;
  },

  // --- CPF/CNPJ Validation ---

  function cpfCnpjValidity(data) {
    for (const party of data.parties) {
      const doc = party.cpf || party.cnpj;
      if (doc && !isValidCpfCnpj(doc)) {
        return {
          ruleCode: "CPF_CNPJ_INVALID",
          ruleName: "CPF/CNPJ inválido",
          ruleCategory: "documento",
          ruleDescription: "CPF/CNPJ deve ser algoritmicamente válido",
          severity: "critical",
          status: "failed",
          fieldName: "party.cpfCnpj",
          expectedValue: "CPF/CNPJ válido",
          actualValue: doc,
          message: `CPF/CNPJ "${doc}" de "${party.fullName}" é inválido.`,
        };
      }
    }
    return null;
  },

  // --- Endereço ---

  function devedorEnderecoRequired(data) {
    const debtors = data.parties.filter(
      (p) => p.role === "debtor" || p.role === "DEVEDOR"
    );
    for (const d of debtors) {
      if (!d.addressStreet) {
        return {
          ruleCode: "DEVEDOR_ENDERECO_REQUIRED",
          ruleName: "Endereço do devedor",
          ruleCategory: "completude",
          ruleDescription: "Devedor deve ter endereço para citação",
          severity: "high",
          status: "failed",
          fieldName: "party.address",
          expectedValue: "endereço completo",
          actualValue: "ausente",
          message: `Devedor "${d.fullName}" não possui endereço.`,
        };
      }
    }
    return null;
  },

  // --- Prescrição ---

  function prescriptionCheck(data) {
    if (!data.dueDate || !data.documentType) return null;

    const result = calculatePrescription(data.documentType, data.dueDate);

    if (result.isPrescribed) {
      return {
        ruleCode: "PRESCRICAO_EXPIRADA",
        ruleName: "Dívida prescrita",
        ruleCategory: "prescricao",
        ruleDescription: "A dívida já está prescrita",
        severity: "critical",
        status: "failed",
        fieldName: "dueDate",
        expectedValue: `Prescrição: ${result.prescriptionDate.toISOString().split("T")[0]}`,
        actualValue: `Prescrito há ${Math.abs(result.daysRemaining)} dias`,
        message: `Dívida prescrita desde ${result.prescriptionDate.toLocaleDateString("pt-BR")}. Prazo: ${result.years} anos.`,
      };
    }

    if (result.isNearPrescription) {
      return {
        ruleCode: "PRESCRICAO_PROXIMA",
        ruleName: "Prescrição próxima",
        ruleCategory: "prescricao",
        ruleDescription: "A prescrição está próxima (< 90 dias)",
        severity: "high",
        status: "warning",
        fieldName: "dueDate",
        expectedValue: `Prescrição: ${result.prescriptionDate.toISOString().split("T")[0]}`,
        actualValue: `${result.daysRemaining} dias restantes`,
        message: `Atenção: prescrição em ${result.daysRemaining} dias (${result.prescriptionDate.toLocaleDateString("pt-BR")}).`,
      };
    }

    return null;
  },

  // --- Documentos ---

  function documentoProcessado(data) {
    const unprocessed = data.documents.filter((d) => !d.isProcessed);
    if (unprocessed.length > 0) {
      return {
        ruleCode: "DOCUMENTO_NAO_PROCESSADO",
        ruleName: "Documentos pendentes",
        ruleCategory: "documento",
        ruleDescription: "Todos os documentos devem estar processados",
        severity: "medium",
        status: "warning",
        fieldName: "documents",
        expectedValue: "todos processados",
        actualValue: `${unprocessed.length} pendente(s)`,
        message: `${unprocessed.length} documento(s) ainda não processado(s).`,
      };
    }
    return null;
  },

  function credorRequired(data) {
    const creditors = data.parties.filter(
      (p) => p.role === "creditor" || p.role === "CREDOR"
    );
    if (creditors.length === 0) {
      return {
        ruleCode: "CREDOR_REQUIRED",
        ruleName: "Credor obrigatório",
        ruleCategory: "completude",
        ruleDescription: "O caso deve ter um credor identificado",
        severity: "high",
        status: "failed",
        fieldName: "parties",
        expectedValue: ">=1 credor",
        actualValue: "0",
        message: "Nenhum credor identificado no caso.",
      };
    }
    return null;
  },
];

/**
 * Run all validation rules against case data.
 */
export function runValidation(data: CaseValidationData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const rule of VALIDATION_RULES) {
    const issue = rule(data);
    if (issue) {
      issues.push(issue);
    }
  }
  return issues;
}
