"use client";

/**
 * Página de listagem de casos.
 * Tabela com filtros, busca, paginação e ações (atribuição, workflow).
 */

import { useState } from "react";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CasesListPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const { data, isLoading, refetch } = trpc.cases.list.useQuery({
    page,
    pageSize: 20,
    search: search || undefined,
    status: statusFilter || undefined,
    caseType: typeFilter || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const cases = data?.items || [];
  const pagination = {
    page: data?.page || 1,
    pageSize: data?.pageSize || 20,
    total: data?.total || 0,
    pages: Math.ceil((data?.total || 0) / (data?.pageSize || 20)),
    hasPrev: (data?.page || 1) > 1,
    hasNext: (data?.page || 1) < Math.ceil((data?.total || 0) / (data?.pageSize || 20)),
  };

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Casos</h1>
        <p className="text-gray-600">Gerencie todos os casos da organização</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Busca */}
          <div>
            <label className="block text-sm font-medium mb-2">Buscar</label>
            <input
              type="text"
              placeholder="ID ou referência..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="received">Recebido</option>
              <option value="analyzing">Analisando</option>
              <option value="validated">Validado</option>
              <option value="calculated">Calculado</option>
              <option value="petition_generated">Petição Gerada</option>
              <option value="filed">Protocolado</option>
              <option value="exception">Exceção</option>
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="execution">Execução</option>
              <option value="collection">Cobrança</option>
            </select>
          </div>

          {/* Nova */}
          <div className="flex items-end">
            <Link href="/cases/new" className="w-full">
              <Button className="w-full">+ Novo Caso</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Carregando...</div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            Nenhum caso encontrado
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {cases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <td className="px-6 py-4 text-sm font-medium">
                        {caseItem.internalReference}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {caseItem.caseType === "execution" ? "Execução" : "Cobrança"}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[caseItem.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {caseItem.status.replace(/_/g, " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(caseItem.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/cases/${caseItem.id}`}>
                            <Button size="sm" variant="outline">
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/cases/${caseItem.id}/petition`}>
                            <Button size="sm" variant="outline">
                              Petição
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages} • Total:{" "}
                  {pagination.total}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
