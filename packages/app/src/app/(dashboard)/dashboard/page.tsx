"use client";

/**
 * Página de Dashboard
 * Métricas gerais: total de casos, breakdown por status
 * Seções: Meus Casos, Casos Recentes
 */

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Briefcase,
  FileText,
  Scale,
  AlertTriangle,
  ArrowRight,
  Calendar,
} from "lucide-react";

export default function DashboardPage() {
  const metricsQuery = trpc.dashboard.getMetrics.useQuery();

  const metrics = metricsQuery.data;
  const statusBreakdown = metrics?.statusBreakdown || [];
  const myCases = metrics?.myCases || [];
  const recent = metrics?.recent || [];
  const openExceptions = metrics?.openExceptions || [];
  const total = metrics?.total || 0;

  // Count status breakdown
  const statusMap: Record<string, number> = {};
  statusBreakdown.forEach((item) => {
    if (item.status) {
      statusMap[item.status] = item.count;
    }
  });

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      received: "Recebido",
      analyzing: "Analisando",
      extraction_complete: "Extração Completa",
      validation_pending: "Validação Pendente",
      validated: "Validado",
      calculated: "Calculado",
      petition_generated: "Petição Gerada",
      filed: "Protocolado",
      exception: "Exceção",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos processos e atividades</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total de Casos
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsQuery.isLoading ? "..." : total}
            </div>
            <p className="text-xs text-gray-500">em toda a organização</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Em Análise
            </CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsQuery.isLoading ? "..." : statusMap["analyzing"] || 0}
            </div>
            <p className="text-xs text-gray-500">processamento em curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Petições
            </CardTitle>
            <Scale className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsQuery.isLoading
                ? "..."
                : statusMap["petition_generated"] || 0}
            </div>
            <p className="text-xs text-gray-500">prontas para revisão</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Exceções
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsQuery.isLoading ? "..." : statusMap["exception"] || 0}
            </div>
            <p className="text-xs text-gray-500">requer atenção</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline de Status */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pipeline de Casos</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsQuery.isLoading ? (
              <div className="text-sm text-gray-500">Carregando...</div>
            ) : statusBreakdown.length === 0 ? (
              <div className="text-sm text-gray-500">
                Nenhum caso registrado
              </div>
            ) : (
              <div className="space-y-2">
                {statusBreakdown.map((item) => (
                  <div key={item.status} className="flex items-center gap-4">
                    <div className="w-24">
                      <p className="text-xs font-medium text-gray-600">
                        {getStatusLabel(item.status || "")}
                      </p>
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 flex items-center px-2">
                      <div
                        className="bg-blue-600 h-4 rounded-full"
                        style={{
                          width: `${Math.min(
                            (item.count / total) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="w-8 text-right">
                      <p className="text-sm font-semibold">{item.count}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Casos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsQuery.isLoading ? (
              <div className="text-sm text-gray-500">Carregando...</div>
            ) : recent.length === 0 ? (
              <div className="text-sm text-gray-500">Sem casos recentes</div>
            ) : (
              <div className="space-y-3">
                {recent.map((caseItem) => (
                  <Link
                    key={caseItem.id}
                    href={`/cases/${caseItem.id}`}
                    className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-200 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {caseItem.internalReference}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {caseItem.title}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                    <div className="mt-2">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          STATUS_COLORS[caseItem.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {caseItem.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exceções Abertas */}
      {openExceptions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-red-900">Exceções Abertas</CardTitle>
            <Link href="/exceptions">
              <Button size="sm" variant="outline">
                Gerenciar
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {openExceptions.map((exception) => (
                <div
                  key={exception.id}
                  className="flex items-start gap-3 p-3 bg-white rounded border border-red-200"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {exception.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {exception.description.substring(0, 100)}...
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                      exception.severity === "critical"
                        ? "bg-red-200 text-red-800"
                        : exception.severity === "high"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-yellow-200 text-yellow-800"
                    }`}
                  >
                    {exception.severity}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meus Casos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Meus Casos</CardTitle>
          <Link href="/cases/list">
            <Button size="sm" variant="outline">
              Ver Tudo
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {metricsQuery.isLoading ? (
            <div className="text-sm text-gray-500">Carregando...</div>
          ) : myCases.length === 0 ? (
            <div className="text-sm text-gray-500">
              Nenhum caso atribuído a você
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Título
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">
                      Criado
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {myCases.map((caseItem) => (
                    <tr
                      key={caseItem.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-900">
                        {caseItem.internalReference}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {caseItem.title}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[caseItem.status] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {caseItem.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(caseItem.createdAt).toLocaleDateString(
                          "pt-BR"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link href={`/cases/${caseItem.id}`}>
                          <Button size="sm" variant="outline">
                            Abrir
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
