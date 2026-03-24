/**
 * JSON schemas for GPT-4o structured extraction output.
 * Each schema defines the expected fields for a document type.
 */

export interface ExtractedField {
  value: string | number | null;
  confidence: number;
  manuallyEdited?: boolean;
}

export interface ExtractedParty {
  nome: ExtractedField;
  cpfCnpj: ExtractedField;
  endereco: ExtractedField;
}

export interface CcbExtraction {
  numeroCedula: ExtractedField;
  valorPrincipal: ExtractedField;
  taxaJuros: ExtractedField;
  indiceCorrecao: ExtractedField;
  dataVencimento: ExtractedField;
  dataEmissao: ExtractedField;
  devedor: ExtractedParty;
  avalista: ExtractedParty | null;
  credor: ExtractedParty;
}

export interface ContractExtraction {
  numeroContrato: ExtractedField;
  valorPrincipal: ExtractedField;
  taxaJuros: ExtractedField;
  indiceCorrecao: ExtractedField;
  dataVencimento: ExtractedField;
  dataAssinatura: ExtractedField;
  numeroParcelas: ExtractedField;
  valorParcela: ExtractedField;
  devedor: ExtractedParty;
  avalista: ExtractedParty | null;
  credor: ExtractedParty;
}

export interface PromissoryExtraction {
  numero: ExtractedField;
  valorNominal: ExtractedField;
  dataVencimento: ExtractedField;
  dataEmissao: ExtractedField;
  localPagamento: ExtractedField;
  emitente: ExtractedParty;
  beneficiario: ExtractedParty;
}

/**
 * The JSON schema sent to GPT-4o's response_format for CCB extraction.
 */
export const CCB_JSON_SCHEMA = {
  type: "object" as const,
  properties: {
    numeroCedula: fieldSchema("Número da cédula de crédito"),
    valorPrincipal: fieldSchema("Valor principal da dívida (número)"),
    taxaJuros: fieldSchema("Taxa de juros (% ao mês ou ao ano)"),
    indiceCorrecao: fieldSchema("Índice de correção monetária"),
    dataVencimento: fieldSchema("Data de vencimento (YYYY-MM-DD)"),
    dataEmissao: fieldSchema("Data de emissão (YYYY-MM-DD)"),
    devedor: partySchema("Devedor principal"),
    avalista: {
      ...partySchema("Avalista/fiador"),
      nullable: true,
    },
    credor: partySchema("Credor/instituição financeira"),
  },
  required: [
    "numeroCedula",
    "valorPrincipal",
    "taxaJuros",
    "indiceCorrecao",
    "dataVencimento",
    "dataEmissao",
    "devedor",
    "avalista",
    "credor",
  ],
  additionalProperties: false,
};

export const EXTRACTION_SCHEMAS: Record<string, Record<string, unknown>> = {
  credit_certificate: CCB_JSON_SCHEMA,
  contract: CCB_JSON_SCHEMA, // Similar structure, reuse
  promissory_note: CCB_JSON_SCHEMA,
};

function fieldSchema(description: string) {
  return {
    type: "object" as const,
    description,
    properties: {
      value: {
        type: ["string", "number", "null"] as const,
        description: "Valor extraído",
      },
      confidence: {
        type: "number" as const,
        description: "Confiança 0-100",
        minimum: 0,
        maximum: 100,
      },
    },
    required: ["value", "confidence"] as const,
    additionalProperties: false,
  };
}

function partySchema(description: string) {
  return {
    type: "object" as const,
    description,
    properties: {
      nome: fieldSchema("Nome completo"),
      cpfCnpj: fieldSchema("CPF ou CNPJ"),
      endereco: fieldSchema("Endereço completo"),
    },
    required: ["nome", "cpfCnpj", "endereco"] as const,
    additionalProperties: false,
  };
}
