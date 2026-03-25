"use client";

import { CheckCircle, AlertTriangle, XCircle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationSummaryProps {
  total: number;
  blocking: number;
  warnings: number;
  passed: number;
}

export function ValidationSummary({
  total,
  blocking,
  warnings,
  passed,
}: ValidationSummaryProps) {
  if (total === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <ShieldCheck className="size-5 text-gray-400" />
        <p className="text-sm text-gray-500">
          Nenhuma validação executada. Clique em &ldquo;Executar Validação&rdquo;.
        </p>
      </div>
    );
  }

  const allPassed = blocking === 0 && warnings === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-lg border p-3",
        allPassed
          ? "border-green-200 bg-green-50"
          : blocking > 0
            ? "border-red-200 bg-red-50"
            : "border-yellow-200 bg-yellow-50"
      )}
    >
      {allPassed ? (
        <CheckCircle className="size-5 text-green-600" />
      ) : blocking > 0 ? (
        <XCircle className="size-5 text-red-600" />
      ) : (
        <AlertTriangle className="size-5 text-yellow-600" />
      )}

      <div className="flex gap-4 text-sm">
        {blocking > 0 && (
          <span className="font-medium text-red-700">
            {blocking} bloqueante{blocking !== 1 ? "s" : ""}
          </span>
        )}
        {warnings > 0 && (
          <span className="font-medium text-yellow-700">
            {warnings} alerta{warnings !== 1 ? "s" : ""}
          </span>
        )}
        <span className="text-green-700">
          {passed} ok
        </span>
      </div>

      {blocking > 0 && (
        <p className="ml-auto text-xs text-red-600">
          Caso bloqueado — resolva as pendências para avançar.
        </p>
      )}
    </div>
  );
}
