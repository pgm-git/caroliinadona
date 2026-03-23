"use client";

import { Inbox, Loader, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QueueSummaryProps {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  errors: number;
  activeFilter: string;
  onFilterChange: (status: "all" | "pending" | "processing" | "completed" | "error") => void;
}

const CARDS = [
  {
    key: "all" as const,
    label: "Total Recebidos",
    icon: Inbox,
    color: "text-gray-600",
    bg: "bg-gray-50",
    border: "border-gray-200",
    activeRing: "ring-gray-400",
    countKey: "total" as const,
  },
  {
    key: "processing" as const,
    label: "Em Processamento",
    icon: Loader,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    activeRing: "ring-blue-400",
    countKey: "processing" as const,
  },
  {
    key: "completed" as const,
    label: "Processados",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-200",
    activeRing: "ring-green-400",
    countKey: "completed" as const,
  },
  {
    key: "error" as const,
    label: "Com Erro",
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    activeRing: "ring-red-400",
    countKey: "errors" as const,
  },
] as const;

export function QueueSummary({
  total,
  pending,
  processing,
  completed,
  errors,
  activeFilter,
  onFilterChange,
}: QueueSummaryProps) {
  const counts = { total, pending, processing, completed, errors };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CARDS.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onFilterChange(card.key)}
            className={cn(
              "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
              card.bg,
              card.border,
              isActive && `ring-2 ${card.activeRing}`
            )}
          >
            <div className={cn("rounded-md p-2", card.bg)}>
              <Icon className={cn("size-5", card.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">{counts[card.countKey]}</p>
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
