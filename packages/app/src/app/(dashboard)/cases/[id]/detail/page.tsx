"use client";

/**
 * Página de detalhe do caso.
 * Timeline de atividades, dados, documentos, ações (workflow).
 */

import { useParams } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;
  const [revertReason, setRevertReason] = useState("");
  const [showRevertModal, setShowRevertModal] = useState(false);

  // Queries
  const caseQuery = trpc.cases.getById.useQuery({ id: caseId });
  const historyQuery = trpc.workflow.getCaseHistory.useQuery({ caseId });
  const nextStatesQuery = trpc.workflow.getNextStates.useQuery({ caseId });

  // Mutations
  const advanceMutation = trpc.workflow.advanceStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`Status avançado para ${data.newStatus}`);
      caseQuery.refetch();
      historyQuery.refetch();
      nextStatesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const revertMutation = trpc.workflow.revertStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`Caso revertido para ${data.newStatus}`);
      setShowRevertModal(false);
      setRevertReason("");
      caseQuery.refetch();
      historyQuery.refetch();
      nextStatesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const caseData = caseQuery.data;
  const history = historyQuery.data || [];
  const nextStates = nextStatesQuery.data?.nextStates || [];
  const stateDescriptions = nextStatesQuery.data?.descriptions || {};

  const STATUS_COLORS: Record<string, string> = {
    received: "bg-gray-100 text-gray-800",
    analyzing: "bg-blue-100 text-blue-800",
    extraction_complete: "bg-green-100 text-green-800",
    validation_pending: "bg-yellow-100 text-yellow-800",
    validated: "bg-green-100 text-green-800",
    calculated: "bg-green-100 text-green-800",
    petition_generated: "bg-purple-100 text-purple-800",
    filed: "bg-green-100 text-green-800",
    exception: "bg-red-100 text-red-800",
  };

  if (caseQuery.isLoading) {
    return <div className="container mx-auto py-6">Carregando...</div>;
  }

  if (!caseData) {
    return <div className="container mx-auto py-6">Caso não encontrado</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{caseData.title}</h1>
          <p className="text-gray-600">ID: {caseData.internalReference}</p>
        </div>
        <span
          className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
            STATUS_COLORS[caseData.status] || "bg-gray-100 text-gray-800"
          }`}
        >
          {caseData.status.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Tipo</p>
          <p className="font-semibold">
            {caseData.caseType === "execution" ? "Execução" : "Cobrança"}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Prioridade</p>
          <p className="font-semibold">{caseData.priority}/5</p>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Criado em</p>
          <p className="font-semibold">
            {new Date(caseData.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Atualizado em</p>
          <p className="font-semibold">
            {new Date(caseData.updatedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6 space-y-4">
        <h2 className="text-xl font-bold">Ações</h2>
        <div className="flex flex-wrap gap-2">
          {nextStates.length > 0 ? (
            <>
              <div className="flex-1 min-w-64">
                <label className="block text-sm font-medium mb-2">
                  Avançar para:
                </label>
                <div className="flex gap-2">
                  <select
                    id="nextStatus"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar status...</option>
                    {nextStates.map((status) => (
                      <option key={status} value={status}>
                        {stateDescriptions[status] || status}
                      </option>
                    ))}
                  </select>
                  <Button
                    onClick={() => {
                      const select = document.getElementById(
                        "nextStatus"
                      ) as HTMLSelectElement;
                      if (select.value) {
                        advanceMutation.mutate({
                          caseId,
                          toStatus: select.value,
                        });
                      }
                    }}
                    disabled={advanceMutation.isPending}
                  >
                    {advanceMutation.isPending ? "..." : "Avançar"}
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowRevertModal(true)}
                >
                  ↶ Reverter com Motivo
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-600">Sem ações disponíveis neste status</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-6">Histórico de Atividades</h2>
        {historyQuery.isLoading ? (
          <p className="text-gray-600">Carregando...</p>
        ) : history.length === 0 ? (
          <p className="text-gray-600">Nenhuma atividade registrada</p>
        ) : (
          <div className="space-y-4">
            {history.map((entry, idx) => (
              <div key={entry.id} className="relative pb-4">
                {idx < history.length - 1 && (
                  <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="relative flex gap-4">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mt-1 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {entry.fromStatus && entry.toStatus
                        ? `Status mudou de ${entry.fromStatus} para ${entry.toStatus}`
                        : entry.action}
                    </p>
                    {entry.reason && (
                      <p className="text-sm text-gray-600">Motivo: {entry.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(entry.createdAt).toLocaleString("pt-BR")} por{" "}
                      {entry.createdBy}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revert Modal */}
      {showRevertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Reverter Caso</h3>
            <p className="text-sm text-gray-600 mb-4">
              Digite o motivo da reversão (mínimo 10 caracteres):
            </p>
            <textarea
              value={revertReason}
              onChange={(e) => setRevertReason(e.target.value)}
              placeholder="Motivo da reversão..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
            />
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowRevertModal(false);
                  setRevertReason("");
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={
                  revertReason.length < 10 || revertMutation.isPending
                }
                onClick={() => {
                  revertMutation.mutate({
                    caseId,
                    targetStatus: "analyzing",
                    reason: revertReason,
                  });
                }}
              >
                {revertMutation.isPending ? "..." : "Reverter"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
