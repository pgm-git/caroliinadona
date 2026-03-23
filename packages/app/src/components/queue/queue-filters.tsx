"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface QueueFiltersProps {
  status: string;
  onStatusChange: (value: "all" | "pending" | "processing" | "completed" | "error") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (value: "asc" | "desc") => void;
  lastUpdated: Date;
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Recebido" },
  { value: "processing", label: "Em Processamento" },
  { value: "completed", label: "Processado" },
  { value: "error", label: "Com Erro" },
] as const;

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "agora";
  if (seconds < 60) return `há ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `há ${minutes}min`;
}

export function QueueFilters({
  status,
  onStatusChange,
  sortOrder,
  onSortOrderChange,
  lastUpdated,
}: QueueFiltersProps) {
  const hasFilters = status !== "all" || sortOrder !== "desc";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <select
          value={status}
          onChange={(e) =>
            onStatusChange(
              e.target.value as "all" | "pending" | "processing" | "completed" | "error"
            )
          }
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as "asc" | "desc")}
          className="h-8 rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value="desc">Mais recentes</option>
          <option value="asc">Mais antigos</option>
        </select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onStatusChange("all");
              onSortOrderChange("desc");
            }}
          >
            <X className="size-4" />
            Limpar
          </Button>
        )}
      </div>

      <span className="text-xs text-gray-400">
        Atualizado {timeAgo(lastUpdated)}
      </span>
    </div>
  );
}
