"use client";

import { Button } from "@/components/ui/button";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { ValidationSummary } from "./validation-summary";
import { ValidationItem } from "./validation-item";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface ValidationChecklistProps {
  caseId: string;
}

export function ValidationChecklist({ caseId }: ValidationChecklistProps) {
  const { data, refetch, isLoading } = trpc.validation.listByCase.useQuery({
    caseId,
  });

  const runMutation = trpc.validation.runValidation.useMutation({
    onSuccess: (result) => {
      toast.success(
        result.count === 0
          ? "Todas as validações passaram!"
          : `${result.count} pendência(s) encontrada(s)`
      );
      refetch();
    },
    onError: () => toast.error("Erro ao executar validação"),
  });

  const resolveMutation = trpc.validation.resolve.useMutation({
    onSuccess: () => {
      toast.success("Validação resolvida");
      refetch();
    },
    onError: () => toast.error("Erro ao resolver validação"),
  });

  const items = data?.items ?? [];
  const summary = data?.summary ?? {
    total: 0,
    blocking: 0,
    warnings: 0,
    passed: 0,
    hasBlockingIssues: false,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-5 text-gray-500" />
          <h3 className="text-sm font-semibold">Validações</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => runMutation.mutate({ caseId })}
          disabled={runMutation.isPending}
        >
          <RefreshCw
            className={cn("mr-1 size-3.5", runMutation.isPending && "animate-spin")}
          />
          Executar Validação
        </Button>
      </div>

      <ValidationSummary
        total={summary.total}
        blocking={summary.blocking}
        warnings={summary.warnings}
        passed={summary.passed}
      />

      {isLoading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ValidationItem
              key={item.id}
              id={item.id}
              ruleName={item.ruleName}
              ruleCategory={item.ruleCategory}
              message={item.message}
              status={item.status}
              severity={item.severity}
              fieldName={item.fieldName}
              expectedValue={item.expectedValue}
              actualValue={item.actualValue}
              resolvedBy={item.resolvedBy}
              resolutionNotes={item.resolutionNotes}
              onResolve={(id, notes) =>
                resolveMutation.mutate({ validationId: id, notes })
              }
              isResolving={resolveMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
