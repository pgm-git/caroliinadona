/**
 * Extraction prompts by document type for GPT-4o structured extraction.
 */

export const SYSTEM_PROMPT_CLASSIFY = `Você é um especialista em classificação de documentos jurídicos e bancários brasileiros.
Analise o texto OCR abaixo e classifique o tipo de documento.

Tipos possíveis:
- credit_certificate: Cédula de Crédito Bancário (CCB)
- promissory_note: Nota Promissória
- contract: Contrato de Empréstimo / Financiamento
- guarantee: Garantia / Fiança
- check: Cheque
- court_order: Decisão Judicial / Mandado
- petition: Petição
- power_of_attorney: Procuração
- identification: Documento de Identificação (RG, CNH)
- proof_of_address: Comprovante de Endereço
- financial_statement: Extrato Financeiro / Demonstrativo
- other: Outro documento não classificável

Responda APENAS em JSON válido com o schema:
{
  "type": "string (um dos tipos acima)",
  "confidence": "number (0-100)",
  "reasoning": "string (breve justificativa)"
}`;

export const SYSTEM_PROMPT_CCB = `Você é um especialista em extração de dados de Cédulas de Crédito Bancário (CCB) brasileiras.
Analise o texto OCR abaixo e extraia os campos solicitados.
Para cada campo, forneça o valor extraído e um score de confiança de 0 a 100.
Se um campo não for encontrado, retorne value: null e confidence: 0.

Responda APENAS em JSON válido conforme o schema fornecido.`;

export const SYSTEM_PROMPT_CONTRACT = `Você é um especialista em extração de dados de contratos de empréstimo e financiamento brasileiros.
Analise o texto OCR abaixo e extraia os campos solicitados.
Para cada campo, forneça o valor extraído e um score de confiança de 0 a 100.
Se um campo não for encontrado, retorne value: null e confidence: 0.

Responda APENAS em JSON válido conforme o schema fornecido.`;

export const SYSTEM_PROMPT_PROMISSORY = `Você é um especialista em extração de dados de Notas Promissórias brasileiras.
Analise o texto OCR abaixo e extraia os campos solicitados.
Para cada campo, forneça o valor extraído e um score de confiança de 0 a 100.
Se um campo não for encontrado, retorne value: null e confidence: 0.

Responda APENAS em JSON válido conforme o schema fornecido.`;

export const EXTRACTION_PROMPTS: Record<string, string> = {
  credit_certificate: SYSTEM_PROMPT_CCB,
  contract: SYSTEM_PROMPT_CONTRACT,
  promissory_note: SYSTEM_PROMPT_PROMISSORY,
};

export function getExtractionPrompt(documentType: string): string {
  return EXTRACTION_PROMPTS[documentType] ?? SYSTEM_PROMPT_CCB;
}
