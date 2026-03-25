"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calculator, RefreshCw } from "lucide-react";

interface CalculationFormProps {
  caseId: string;
  defaults?: {
    principalAmount?: number;
    contractDate?: string;
    defaultDate?: string;
    correctionIndex?: string;
    interestRate?: number;
    penaltyRate?: number;
  };
  onCalculate: (params: CalculationFormValues) => void;
  isPending: boolean;
}

export interface CalculationFormValues {
  caseId: string;
  principalAmount: number;
  contractDate: string;
  defaultDate: string;
  calculationDate: string;
  correctionIndex:
    | "igpm"
    | "ipca"
    | "inpc"
    | "selic"
    | "cdi"
    | "tr"
    | "tjlp"
    | "custom";
  interestRateMonthly: number;
  interestType: "simple" | "compound";
  penaltyRate: number;
  attorneyFeesRate: number;
  courtCosts: number;
  otherCharges: number;
}

const INDEX_OPTIONS = [
  { value: "igpm", label: "IGP-M" },
  { value: "ipca", label: "IPCA" },
  { value: "inpc", label: "INPC" },
  { value: "selic", label: "SELIC" },
  { value: "cdi", label: "CDI" },
  { value: "tr", label: "TR" },
];

export function CalculationForm({
  caseId,
  defaults,
  onCalculate,
  isPending,
}: CalculationFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [principal, setPrincipal] = useState(
    String(defaults?.principalAmount ?? "")
  );
  const [contractDate, setContractDate] = useState(
    defaults?.contractDate ?? ""
  );
  const [defaultDate, setDefaultDate] = useState(defaults?.defaultDate ?? "");
  const [calculationDate, setCalculationDate] = useState(today);
  const [index, setIndex] = useState(defaults?.correctionIndex ?? "igpm");
  const [interestRate, setInterestRate] = useState(
    String(defaults?.interestRate ?? "1.0")
  );
  const [interestType, setInterestType] = useState<"simple" | "compound">(
    "simple"
  );
  const [penaltyRate, setPenaltyRate] = useState(
    String(defaults?.penaltyRate ?? "2.0")
  );
  const [feesRate, setFeesRate] = useState("10.0");
  const [courtCosts, setCourtCosts] = useState("0");
  const [otherCharges, setOtherCharges] = useState("0");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate({
      caseId,
      principalAmount: parseFloat(principal) || 0,
      contractDate,
      defaultDate,
      calculationDate,
      correctionIndex: index as CalculationFormValues["correctionIndex"],
      interestRateMonthly: parseFloat(interestRate) || 0,
      interestType,
      penaltyRate: parseFloat(penaltyRate) || 0,
      attorneyFeesRate: parseFloat(feesRate) || 0,
      courtCosts: parseFloat(courtCosts) || 0,
      otherCharges: parseFloat(otherCharges) || 0,
    });
  }

  const isValid =
    parseFloat(principal) > 0 && contractDate && defaultDate && calculationDate;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-2">
        <Calculator className="size-5 text-gray-500" />
        <h3 className="text-sm font-semibold">Par&acirc;metros do C&aacute;lculo</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Valor Principal (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="0.00"
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            &Iacute;ndice de Corre&ccedil;&atilde;o
          </label>
          <select
            value={index}
            onChange={(e) => setIndex(e.target.value)}
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            {INDEX_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Data Contrato
          </label>
          <Input
            type="date"
            value={contractDate}
            onChange={(e) => setContractDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Data Inadimpl&ecirc;ncia
          </label>
          <Input
            type="date"
            value={defaultDate}
            onChange={(e) => setDefaultDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Data C&aacute;lculo
          </label>
          <Input
            type="date"
            value={calculationDate}
            onChange={(e) => setCalculationDate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Juros (% a.m.)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de Juros
          </label>
          <select
            value={interestType}
            onChange={(e) =>
              setInterestType(e.target.value as "simple" | "compound")
            }
            className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="simple">Simples</option>
            <option value="compound">Compostos</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Multa (%)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={penaltyRate}
            onChange={(e) => setPenaltyRate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Honor&aacute;rios (%)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={feesRate}
            onChange={(e) => setFeesRate(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Custas (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={courtCosts}
            onChange={(e) => setCourtCosts(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Outros (R$)
          </label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={otherCharges}
            onChange={(e) => setOtherCharges(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
      </div>

      <Button type="submit" disabled={!isValid || isPending} className="w-full">
        <RefreshCw
          className={cn("mr-2 size-4", isPending && "animate-spin")}
        />
        Calcular
      </Button>
    </form>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
