"use client";

/**
 * Página de Exceções
 * Lista de exceções abertas, com opções de resolver/descartar
 */

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, XCircle, Zap } from "lucide-react";

export default function ExceptionsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = trpc.exceptions.getOpen.useQuery({
    page,
    pageSize: 20,
  });

  const statisticsQuery = trpc.exceptions.getStatistics.useQuery();

  const resolveMutation = trpc.exceptions.resolve.useMutation({
    onSuccess: () => {
      toast.success("Exceção resolvida com sucesso");
      refetch();
      statisticsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const dismissMutation = trpc.exceptions.dismiss.useMutation({
    onSuccess: () => {
      toast.success("Exceção descartada com sucesso");
      refetch();
      statisticsQuery.refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const exceptions = data?.items || [];
  const total = data?.total || 0;
  const stats = statisticsQuery.data;

  const SEVERITY_COLORS: Record<string, string> = {
    low: "bg-blue-100 text-blue-800 border border-blue-200",
    medium: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    high: "bg-orange-100 text-orange-800 border border-orange-200",
    critical: "bg-red-100 text-red-800 border border-red-200",
  };

  const SEVERITY_ICON: Record<string, React.ReactNode> = {
    low: <Zap className="w-4 h-4" />,
    medium: <AlertTriangle className="w-4 h-4" />,
    high: <AlertTriangle className="w-4 h-4" />,
    critical: <AlertTriangle className="w-4 h-4" />,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Exceções</h1>
        <p className="text-gray-600">Gerenciamento de exceções do processo</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold">{stats.totalExceptions}</p>
            <p className="text-xs text-gray-500 mt-1">Todas as exceções</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Críticas</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.bySeverity.critical}
            </p>
            <p className="text-xs text-gray-500 mt-1">requer atenção urgente</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Bloqueando Pipeline</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.blockingPipeline}
            </p>
            <p className="text-xs text-gray-500 mt-1">impedem progresso</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-1">Abertas</p>
            <p className="text-2xl font-bold">{stats.byStatus.open}</p>
            <p className="text-xs text-gray-500 mt-1">em andamento</p>
          </div>
        </div>
      )}

      {/* Exceptions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold">Exceções Abertas</h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando...</div>
        ) : exceptions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhuma exceção aberta
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Severidade
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Caso
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exceptions.map((exception) => (
                  <tr
                    key={exception.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                      {exception.title}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          SEVERITY_COLORS[exception.severity] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {SEVERITY_ICON[exception.severity]}
                        {exception.severity.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {exception.exceptionType.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/cases/${exception.caseId}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Ver caso
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(exception.createdAt).toLocaleDateString(
                        "pt-BR"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const reason = prompt(
                              "Descreva como a exceção foi resolvida:"
                            );
                            if (reason && reason.length >= 10) {
                              resolveMutation.mutate({
                                exceptionId: exception.id,
                                resolution: reason,
                              });
                            } else if (reason) {
                              toast.error(
                                "Descrição deve ter pelo menos 10 caracteres"
                              );
                            }
                          }}
                          disabled={resolveMutation.isPending}
                          title="Marcar como resolvida"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (
                              confirm(
                                "Tem certeza que deseja descartar esta exceção?"
                              )
                            ) {
                              dismissMutation.mutate({
                                exceptionId: exception.id,
                              });
                            }
                          }}
                          disabled={dismissMutation.isPending}
                          title="Descartar exceção"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {exceptions.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total: {total} exceções abertas
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={exceptions.length < 20}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
