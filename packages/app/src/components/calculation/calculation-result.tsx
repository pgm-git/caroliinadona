"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Percent,
  Gavel,
  FileSpreadsheet,
} from "lucide-react";

interface LegalWarning {
  code: string;
  message: string;
  field: string;
  limit: number;
  actual: number;
}

interface CalculationSummary {
  principalAmount: number;
  correctedAmount: number;
  correctionDifference: number;
  interestAmount: number;
  penaltyAmount: number;
  attorneyFeesAmount: number;
  courtCosts: number;
  otherCharges: number;
  totalAmount: number;
}

interface CalculationResultProps {
  summary: CalculationSummary;
  warnings: LegalWarning[];
  version: number;
  onValidate?: () => void;
  onExport?: () => void;
  isValidating?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function SummaryRow({
  label,
  value,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-2 ${highlight ? "bg-blue-50 font-semibold" : ""}`}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-gray-500" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-sm ${highlight ? "text-blue-700" : ""}`}>
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function CalculationResult({
  summary,
  warnings,
  version,
  onValidate,
  onExport,
  isValidating,
}: CalculationResultProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="size-5 text-green-600" />
          <h3 className="text-sm font-semibold">Resultado do C&aacute;lculo</h3>
        </div>
        <Badge variant="outline" className="text-[10px]">
          v{version}
        </Badge>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-2"
            >
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-yellow-600" />
              <p className="text-xs text-yellow-700">{w.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="space-y-1 rounded-lg border p-3">
        <SummaryRow
          label="Principal"
          value={summary.principalAmount}
          icon={DollarSign}
        />
        <SummaryRow
          label="Corre&ccedil;&atilde;o Monet&aacute;ria"
          value={summary.correctionDifference}
          icon={TrendingUp}
        />
        <SummaryRow
          label="Juros"
          value={summary.interestAmount}
          icon={Percent}
        />
        <SummaryRow
          label="Multa"
          value={summary.penaltyAmount}
          icon={AlertTriangle}
        />
        <SummaryRow
          label="Honor&aacute;rios"
          value={summary.attorneyFeesAmount}
          icon={Gavel}
        />
        {summary.courtCosts > 0 && (
          <SummaryRow
            label="Custas"
            value={summary.courtCosts}
            icon={FileSpreadsheet}
          />
        )}
        {summary.otherCharges > 0 && (
          <SummaryRow
            label="Outros"
            value={summary.otherCharges}
            icon={FileSpreadsheet}
          />
        )}
        <div className="my-1 border-t" />
        <SummaryRow
          label="Total"
          value={summary.totalAmount}
          icon={DollarSign}
          highlight
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onValidate && (
          <Button
            size="sm"
            onClick={onValidate}
            disabled={isValidating}
          >
            <CheckCircle className="mr-1 size-3.5" />
            Validar C&aacute;lculo
          </Button>
        )}
        {onExport && (
          <Button size="sm" variant="outline" onClick={onExport}>
            <FileSpreadsheet className="mr-1 size-3.5" />
            Exportar Planilha
          </Button>
        )}
      </div>
    </div>
  );
}
