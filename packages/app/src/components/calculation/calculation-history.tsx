"use client";

import { Badge } from "@/components/ui/badge";
import { History, CheckCircle } from "lucide-react";

interface CalculationVersion {
  id: string;
  version: number;
  totalAmount: string;
  isCurrent: boolean;
  isValidated: boolean;
  calculationDate: string;
  createdAt: string;
}

interface CalculationHistoryProps {
  versions: CalculationVersion[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

function formatCurrency(value: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(parseFloat(value));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

export function CalculationHistory({
  versions,
  onSelect,
  selectedId,
}: CalculationHistoryProps) {
  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b pb-2">
        <History className="size-4 text-gray-500" />
        <h4 className="text-sm font-semibold">
          Hist&oacute;rico de Vers&otilde;es
        </h4>
      </div>

      <div className="space-y-1">
        {versions.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className={`flex w-full items-center justify-between rounded-lg border p-2 text-left transition-colors hover:bg-gray-50 ${
              selectedId === v.id ? "border-blue-300 bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium">v{v.version}</span>
              {v.isCurrent && (
                <Badge variant="default" className="text-[9px]">
                  Atual
                </Badge>
              )}
              {v.isValidated && (
                <CheckCircle className="size-3 text-green-600" />
              )}
            </div>
            <div className="text-right">
              <p className="text-xs font-medium">
                {formatCurrency(v.totalAmount)}
              </p>
              <p className="text-[10px] text-gray-400">
                {formatDate(v.createdAt)}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
