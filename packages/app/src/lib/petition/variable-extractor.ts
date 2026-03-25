/**
 * Extrator de variáveis de um caso para petição.
 * Coleta dados de parties, cases, calculations, validations, courts.
 */

import { db } from "@/server/db/client";
import {
  cases as casesTable,
  parties,
  calculations,
  courts,
  organizations,
} from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

export interface ExtractedVariables {
  // Partes (credor e devedor)
  creditorName: string;
  creditorDocumentType: string;
  creditorDocumentNumber: string;
  creditorAddress: string;
  creditorPersonType: string;
  debtorName: string;
  debtorDocumentType: string;
  debtorDocumentNumber: string;
  debtorAddress: string;
  debtorPersonType: string;

  // Caso
  internalReference: string;
  caseType: string;
  state: string;
  varName: string;
  forum: string;
  city: string;

  // Cálculo
  principalAmount: number;
  principalAmountFormatted: string;
  correctionDifference: number;
  correctionDifferenceFormatted: string;
  interestAmount: number;
  interestAmountFormatted: string;
  penaltyAmount: number;
  penaltyAmountFormatted: string;
  attorneyFeesAmount: number;
  attorneyFeesAmountFormatted: string;
  totalAmount: number;
  totalAmountFormatted: string;
  totalAmountWords: string;

  // Datas
  contractDate: string;
  defaultDate: string;
  filingDate: string;

  // Advogado
  lawyerName: string;
  lawyerOabNumber: string;
  lawyerOabState: string;

  // Tribunal
  tribunal: string;

  // Refinement (placeholder para GPT-4o)
  refinementHtml: string;
}

/**
 * Extrai todas as variáveis necessárias para renderizar um template de petição.
 */
export async function extractVariables(
  caseId: string,
  orgId: string
): Promise<ExtractedVariables> {
  // 1. Busca caso
  const [caseData] = await db
    .select()
    .from(casesTable)
    .where(
      and(eq(casesTable.id, caseId), eq(casesTable.orgId, orgId))
    )
    .limit(1);

  if (!caseData) {
    throw new Error(`Case ${caseId} not found`);
  }

  // 2. Busca cálculo (obrigatório)
  const [calculation] = await db
    .select()
    .from(calculations)
    .where(
      and(
        eq(calculations.caseId, caseId),
        eq(calculations.isCurrent, true)
      )
    )
    .limit(1);

  if (!calculation) {
    throw new Error(
      `No current calculation found for case ${caseId}. Calculation is required for petition generation.`
    );
  }

  // 3. Busca partes (credor e devedor)
  const caseParties = await db
    .select()
    .from(parties)
    .where(eq(parties.caseId, caseId));

  const creditor = caseParties.find((p) => p.role === "creditor");
  const debtor = caseParties.find((p) => p.role === "debtor");

  if (!creditor) {
    throw new Error(`Creditor not found for case ${caseId}`);
  }

  if (!debtor) {
    throw new Error(`Debtor not found for case ${caseId}`);
  }

  // 4. Busca tribunal (court)
  const court = caseData.courtId
    ? await db.select().from(courts).where(eq(courts.id, caseData.courtId)).limit(1)
    : null;

  const courtData = court?.[0];

  // 5. Busca organização e informações de advogado
  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  const orgData = org?.[0];

  // 6. Formata valores monetários
  const formatCurrency = (value: string | number | null): string => {
    if (!value) return "R$ 0,00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return num.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const numbersToWords = (num: number): string => {
    // Implementação simplificada — em produção usaria biblioteca como `numero-por-extenso`
    const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
    const teens = [
      "dez",
      "onze",
      "doze",
      "treze",
      "quatorze",
      "quinze",
      "dezesseis",
      "dezessete",
      "dezoito",
      "dezenove",
    ];
    const tens = [
      "",
      "",
      "vinte",
      "trinta",
      "quarenta",
      "cinquenta",
      "sessenta",
      "setenta",
      "oitenta",
      "noventa",
    ];
    const scales = ["", "mil", "milhão", "bilhão"];

    if (num === 0) return "zero";

    let result = "";
    let scaleIndex = 0;

    while (num > 0) {
      const group = num % 1000;
      if (group !== 0) {
        result = groupToWords(group, units, teens, tens) + (scales[scaleIndex] ? " " + scales[scaleIndex] : "") + (result ? " " + result : "");
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    return result.trim();
  };

  const groupToWords = (
    num: number,
    units: string[],
    teens: string[],
    tens: string[]
  ): string => {
    let result = "";

    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
      const hundredsWords = [
        "",
        "cento",
        "duzentos",
        "trezentos",
        "quatrocentos",
        "quinhentos",
        "seiscentos",
        "setecentos",
        "oitocentos",
        "novecentos",
      ];
      result = hundredsWords[hundreds];
    }

    const remainder = num % 100;
    if (remainder >= 10 && remainder < 20) {
      result = result ? result + " " + teens[remainder - 10] : teens[remainder - 10];
    } else {
      const tensDigit = Math.floor(remainder / 10);
      const onesDigit = remainder % 10;

      if (tensDigit > 0) {
        result = result ? result + " " + tens[tensDigit] : tens[tensDigit];
      }

      if (onesDigit > 0) {
        result = result ? result + " " + units[onesDigit] : units[onesDigit];
      }
    }

    return result;
  };

  const totalAmount = parseFloat(calculation.totalAmount || "0");
  const totalAmountWords = numbersToWords(Math.floor(totalAmount));

  // 7. Monta resultado
  const variables: ExtractedVariables = {
    // Partes
    creditorName: creditor.fullName || "Credor",
    creditorDocumentType: creditor.personType === "individual" ? "CPF" : "CNPJ",
    creditorDocumentNumber: creditor.personType === "individual" ? (creditor.cpf || "") : (creditor.cnpj || ""),
    creditorAddress: `${creditor.addressStreet || ""} ${creditor.addressNumber || ""}, ${creditor.addressCity || ""}`,
    creditorPersonType: creditor.personType === "individual" ? "física" : "jurídica",
    debtorName: debtor.fullName || "Devedor",
    debtorDocumentType: debtor.personType === "individual" ? "CPF" : "CNPJ",
    debtorDocumentNumber: debtor.personType === "individual" ? (debtor.cpf || "") : (debtor.cnpj || ""),
    debtorAddress: `${debtor.addressStreet || ""} ${debtor.addressNumber || ""}, ${debtor.addressCity || ""}`,
    debtorPersonType: debtor.personType === "individual" ? "física" : "jurídica",

    // Caso
    internalReference: caseData.internalReference || "",
    caseType: caseData.caseType || "execution",
    state: courtData?.state || orgData?.addressState || "SP",
    varName: courtData?.name || "Cível",
    forum: courtData?.city || orgData?.addressCity || "São Paulo",
    city: orgData?.addressCity || "São Paulo",

    // Cálculo
    principalAmount: parseFloat(calculation.principalAmount || "0"),
    principalAmountFormatted: formatCurrency(calculation.principalAmount),
    correctionDifference: parseFloat(calculation.correctedAmount || "0") - parseFloat(calculation.principalAmount || "0"),
    correctionDifferenceFormatted: formatCurrency(
      parseFloat(calculation.correctedAmount || "0") - parseFloat(calculation.principalAmount || "0")
    ),
    interestAmount: parseFloat(calculation.interestAmount || "0"),
    interestAmountFormatted: formatCurrency(calculation.interestAmount),
    penaltyAmount: parseFloat(calculation.penaltyAmount || "0"),
    penaltyAmountFormatted: formatCurrency(calculation.penaltyAmount),
    attorneyFeesAmount: parseFloat(calculation.attorneyFeesAmount || "0"),
    attorneyFeesAmountFormatted: formatCurrency(calculation.attorneyFeesAmount),
    totalAmount,
    totalAmountFormatted: formatCurrency(calculation.totalAmount),
    totalAmountWords: `${totalAmountWords} reais`,

    // Datas
    contractDate: caseData.createdAt?.toLocaleDateString("pt-BR") || "",
    defaultDate: calculation.defaultDate || "",
    filingDate: new Date().toLocaleDateString("pt-BR"),

    // Advogado (placeholder — em produção vem do usuário logado)
    lawyerName: orgData?.name || "Advogado",
    lawyerOabNumber: orgData?.oabNumber || "000000",
    lawyerOabState: orgData?.addressState || "SP",

    // Tribunal
    tribunal: courtData?.tribunalAcronym || "TJSP",

    // Refinement (placeholder — será preenchido por GPT-4o em Story 6.3)
    refinementHtml: "",
  };

  return variables;
}
