"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import {
  CalculationForm,
  type CalculationFormValues,
} from "@/components/calculation/calculation-form";
import { CalculationResult } from "@/components/calculation/calculation-result";
import { MonthlyBreakdownTable } from "@/components/calculation/monthly-breakdown-table";
import { CalculationHistory } from "@/components/calculation/calculation-history";

interface MonthlyEntry {
  month: string;
  indexRate: number;
  cumulativeFactor: number;
  correctedBalance: number;
  correctionInMonth: number;
}

export default function CalculationPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const [result, setResult] = useState<{
    summary: {
      principalAmount: number;
      correctedAmount: number;
      correctionDifference: number;
      interestAmount: number;
      penaltyAmount: number;
      attorneyFeesAmount: number;
      courtCosts: number;
      otherCharges: number;
      totalAmount: number;
    };
    warnings: Array<{
      code: string;
      message: string;
      field: string;
      limit: number;
      actual: number;
    }>;
    calculationId: string;
    version: number;
    correction: {
      monthlyBreakdown: MonthlyEntry[];
    };
  } | null>(null);

  const historyQuery = trpc.calculation.getHistory.useQuery({ caseId });

  const calculateMutation = trpc.calculation.calculate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      historyQuery.refetch();
      toast.success("C\u00e1lculo realizado com sucesso!");
    },
    onError: () => toast.error("Erro ao realizar c\u00e1lculo"),
  });

  const validateMutation = trpc.calculation.validate.useMutation({
    onSuccess: () => {
      toast.success("C\u00e1lculo validado!");
      historyQuery.refetch();
    },
    onError: () => toast.error("Erro ao validar c\u00e1lculo"),
  });

  function handleCalculate(values: CalculationFormValues) {
    calculateMutation.mutate(values);
  }

  function handleValidate() {
    if (result) {
      validateMutation.mutate({ calculationId: result.calculationId });
    }
  }

  const versions = (historyQuery.data ?? []).map((v) => ({
    id: v.id,
    version: v.version,
    totalAmount: v.totalAmount,
    isCurrent: v.isCurrent,
    isValidated: v.isValidated,
    calculationDate: v.calculationDate,
    createdAt: v.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-lg font-bold">C&aacute;lculo de D&eacute;bito</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Form + History */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <CalculationForm
              caseId={caseId}
              onCalculate={handleCalculate}
              isPending={calculateMutation.isPending}
            />
          </div>

          {versions.length > 0 && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <CalculationHistory
                versions={versions}
                onSelect={() => {}}
              />
            </div>
          )}
        </div>

        {/* Right Column: Result + Breakdown */}
        <div className="space-y-6">
          {result && (
            <>
              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <CalculationResult
                  summary={result.summary}
                  warnings={result.warnings}
                  version={result.version}
                  onValidate={handleValidate}
                  isValidating={validateMutation.isPending}
                />
              </div>

              <div className="rounded-xl border bg-white p-4 shadow-sm">
                <MonthlyBreakdownTable
                  entries={result.correction.monthlyBreakdown}
                />
              </div>
            </>
          )}

          {!result && (
            <div className="flex h-64 items-center justify-center rounded-xl border bg-gray-50">
              <p className="text-sm text-gray-400">
                Preencha os par&acirc;metros e clique em &ldquo;Calcular&rdquo;
                para ver o resultado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
