"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface CaseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  caseType: string;
  onCaseTypeChange: (value: string) => void;
  onClear: () => void;
}

const STATUS_OPTIONS = [
  { value: "", label: "Todos os status" },
  { value: "received", label: "Recebido" },
  { value: "analyzing", label: "Em Análise" },
  { value: "extraction_complete", label: "Extração Completa" },
  { value: "validated", label: "Validado" },
  { value: "calculated", label: "Calculado" },
  { value: "petition_generated", label: "Petição Gerada" },
  { value: "reviewed", label: "Revisado" },
  { value: "filed", label: "Protocolado" },
];

const TYPE_OPTIONS = [
  { value: "", label: "Todos os tipos" },
  { value: "execution", label: "Execução" },
  { value: "collection", label: "Cobrança" },
];

export function CaseFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  caseType,
  onCaseTypeChange,
  onClear,
}: CaseFiltersProps) {
  const hasFilters = search || status || caseType;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar por título ou referência..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={caseType}
        onChange={(e) => onCaseTypeChange(e.target.value)}
        className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="size-4" />
          Limpar
        </Button>
      )}
    </div>
  );
}
