"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scale,
  BarChart3,
  Users,
  RefreshCw,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface ClassificationPanelProps {
  caseId: string;
}

interface ClassificationData {
  actionType: string;
  actionTypeLabel: string;
  complexity: string;
  complexityLabel: string;
  litisconsortium: {
    detected: boolean;
    type: string | null;
    partyCount: number;
  };
  confidence: number;
  reasoning: string;
}

const COMPLEXITY_COLORS: Record<string, string> = {
  simple: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  complex: "bg-red-100 text-red-800",
};

export function ClassificationPanel({ caseId }: ClassificationPanelProps) {
  const [result, setResult] = useState<ClassificationData | null>(null);
  const [overriding, setOverriding] = useState(false);
  const [newType, setNewType] = useState("execution");
  const [justification, setJustification] = useState("");

  const classifyMutation = trpc.classification.classify.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success("Classificação realizada");
    },
    onError: () => toast.error("Erro ao classificar"),
  });

  const overrideMutation = trpc.classification.override.useMutation({
    onSuccess: () => {
      toast.success("Classificação alterada com sucesso");
      setOverriding(false);
      setJustification("");
    },
    onError: () => toast.error("Erro ao alterar classificação"),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="size-5 text-gray-500" />
          <h3 className="text-sm font-semibold">Classificação</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => classifyMutation.mutate({ caseId })}
          disabled={classifyMutation.isPending}
        >
          <RefreshCw
            className={`mr-1 size-3.5 ${classifyMutation.isPending ? "animate-spin" : ""}`}
          />
          Classificar
        </Button>
      </div>

      {!result && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm text-gray-500">
            Clique em &ldquo;Classificar&rdquo; para analisar o caso.
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {/* Action Type */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <Scale className="size-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Tipo de Ação</p>
                <p className="text-sm font-medium">{result.actionTypeLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {Math.round(result.confidence * 100)}%
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setOverriding(!overriding)}
                aria-label="Alterar classificação"
              >
                <Pencil className="size-3" />
              </Button>
            </div>
          </div>

          {/* Override UI */}
          {overriding && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-2">
              <p className="text-xs font-medium text-blue-700">
                Alterar Classificação
              </p>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="execution">Execução</option>
                <option value="collection">Cobrança</option>
              </select>
              <Input
                placeholder="Justificativa obrigatória (mín. 10 caracteres)..."
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    justification.length < 10 || overrideMutation.isPending
                  }
                  onClick={() =>
                    overrideMutation.mutate({
                      caseId,
                      newCaseType: newType as "execution" | "collection",
                      justification,
                    })
                  }
                >
                  <Check className="mr-1 size-3" />
                  Confirmar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setOverriding(false)}
                >
                  <X className="mr-1 size-3" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Complexity */}
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <BarChart3 className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Complexidade</p>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_COLORS[result.complexity] ?? ""}`}
              >
                {result.complexityLabel}
              </span>
            </div>
          </div>

          {/* Litisconsortium */}
          <div className="flex items-center gap-2 rounded-lg border p-3">
            <Users className="size-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Litisconsórcio</p>
              {result.litisconsortium.detected ? (
                <p className="text-sm font-medium">
                  Detectado ({result.litisconsortium.type === "necessary" ? "Necessário" : "Facultativo"})
                  — {result.litisconsortium.partyCount} partes
                </p>
              ) : (
                <p className="text-sm text-gray-400">Não detectado</p>
              )}
            </div>
          </div>

          {/* Reasoning */}
          <p className="text-xs text-gray-400 italic">{result.reasoning}</p>
        </div>
      )}
    </div>
  );
}
