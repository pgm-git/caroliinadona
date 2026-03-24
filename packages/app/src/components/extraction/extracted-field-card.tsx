"use client";

import { EditableField } from "./editable-field";

interface FieldData {
  value: string | number | null;
  confidence: number;
  manuallyEdited?: boolean;
}

interface ExtractedFieldCardProps {
  fields: Record<string, unknown>;
  onSaveField: (fieldPath: string, newValue: string) => void;
  isSaving?: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  numeroCedula: "Número da Cédula",
  numeroContrato: "Número do Contrato",
  numero: "Número",
  valorPrincipal: "Valor Principal",
  valorNominal: "Valor Nominal",
  taxaJuros: "Taxa de Juros",
  indiceCorrecao: "Índice de Correção",
  dataVencimento: "Data de Vencimento",
  dataEmissao: "Data de Emissão",
  dataAssinatura: "Data de Assinatura",
  numeroParcelas: "Número de Parcelas",
  valorParcela: "Valor da Parcela",
  localPagamento: "Local de Pagamento",
};

function isFieldData(obj: unknown): obj is FieldData {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "confidence" in obj &&
    "value" in obj
  );
}

function isPartyData(obj: unknown): boolean {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "nome" in (obj as Record<string, unknown>) &&
    "cpfCnpj" in (obj as Record<string, unknown>)
  );
}

export function ExtractedFieldCard({
  fields,
  onSaveField,
  isSaving,
}: ExtractedFieldCardProps) {
  const entries = Object.entries(fields);

  // Separate simple fields from party objects
  const simpleFields = entries.filter(
    ([, val]) => isFieldData(val) && !isPartyData(val)
  );

  return (
    <div className="space-y-2">
      {simpleFields.map(([key, val]) => {
        const field = val as FieldData;
        return (
          <EditableField
            key={key}
            label={FIELD_LABELS[key] ?? key}
            value={field.value}
            confidence={field.confidence}
            manuallyEdited={field.manuallyEdited}
            onSave={(newValue) => onSaveField(key, newValue)}
            isSaving={isSaving}
          />
        );
      })}
    </div>
  );
}
