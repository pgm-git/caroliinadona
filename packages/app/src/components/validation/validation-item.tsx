"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationItemProps {
  id: string;
  ruleName: string;
  ruleCategory: string;
  message: string;
  status: string;
  severity: string;
  fieldName: string | null;
  expectedValue: string | null;
  actualValue: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  onResolve: (id: string, notes: string) => void;
  isResolving?: boolean;
}

function StatusIcon({ status, severity }: { status: string; severity: string }) {
  if (status === "passed") return <CheckCircle className="size-4 text-green-600" />;
  if (status === "warning") return <AlertTriangle className="size-4 text-yellow-600" />;
  if (severity === "critical") return <XCircle className="size-4 text-red-600" />;
  return <XCircle className="size-4 text-red-500" />;
}

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    critical: { label: "Bloqueante", variant: "destructive" },
    high: { label: "Alto", variant: "destructive" },
    medium: { label: "Médio", variant: "default" },
    low: { label: "Baixo", variant: "secondary" },
  };
  const c = config[severity] ?? config.medium;
  return <Badge variant={c.variant} className="text-[10px]">{c.label}</Badge>;
}

export function ValidationItem({
  id,
  ruleName,
  ruleCategory,
  message,
  status,
  severity,
  fieldName,
  expectedValue,
  actualValue,
  resolvedBy,
  resolutionNotes,
  onResolve,
  isResolving,
}: ValidationItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState("");
  const isResolved = status === "passed" && resolvedBy;

  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        status === "passed" && "border-green-200 bg-green-50/50",
        status === "warning" && "border-yellow-200 bg-yellow-50/50",
        status === "failed" && severity === "critical" && "border-red-300 bg-red-50/50",
        status === "failed" && severity !== "critical" && "border-red-200 bg-red-50/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusIcon status={status} severity={severity} />
          <span className="text-sm font-medium">{ruleName}</span>
          <Badge variant="outline" className="text-[10px]">{ruleCategory}</Badge>
          <SeverityBadge severity={severity} />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )}
        </Button>
      </div>

      <p className="mt-1 text-sm text-gray-600">{message}</p>

      {expanded && (
        <div className="mt-3 space-y-2 border-t pt-2">
          {fieldName && (
            <p className="text-xs text-gray-500">
              Campo: <code className="rounded bg-gray-100 px-1">{fieldName}</code>
            </p>
          )}
          {expectedValue && (
            <p className="text-xs text-gray-500">Esperado: {expectedValue}</p>
          )}
          {actualValue && (
            <p className="text-xs text-gray-500">Encontrado: {actualValue}</p>
          )}

          {isResolved && resolutionNotes && (
            <div className="rounded bg-green-100 p-2 text-xs text-green-800">
              Resolvido manualmente: {resolutionNotes}
            </div>
          )}

          {status !== "passed" && (
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Justificativa para resolver..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-7 text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                disabled={notes.length < 5 || isResolving}
                onClick={() => {
                  onResolve(id, notes);
                  setNotes("");
                }}
              >
                Resolver
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
