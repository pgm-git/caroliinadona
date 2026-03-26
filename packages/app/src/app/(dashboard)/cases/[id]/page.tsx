"use client";

import { useParams } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, FileText, Calculator, ScrollText, AlertTriangle, Calendar, Tag, Hash } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
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

const STATUS_COLORS: Record<string, string> = {
  received: "bg-gray-100 text-gray-800",
  analyzing: "bg-blue-100 text-blue-800",
  extraction_complete: "bg-cyan-100 text-cyan-800",
  validation_pending: "bg-yellow-100 text-yellow-800",
  validated: "bg-green-100 text-green-800",
  calculated: "bg-green-100 text-green-800",
  petition_generated: "bg-purple-100 text-purple-800",
  filed: "bg-green-700 text-white",
  exception: "bg-red-100 text-red-800",
};

const TYPE_LABELS: Record<string, string> = {
  execution: "Execução de Título Extrajudicial",
  collection: "Ação de Cobrança",
};

function formatCurrency(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
}

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const { data: caseData, isLoading, error } = trpc.cases.getById.useQuery({ id: caseId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500 text-sm">
        Carregando caso...
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600 font-medium">Caso não encontrado</p>
        <Link href="/cases/list">
          <Button variant="outline">Voltar para a lista</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/cases/list">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-500 font-mono">{caseData.internalReference}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[caseData.status] || "bg-gray-100 text-gray-800"}`}
              >
                {STATUS_LABELS[caseData.status] || caseData.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
            {caseData.description && (
              <p className="text-sm text-gray-500 mt-1">{caseData.description}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <Link href={`/cases/${caseId}/calculation`}>
            <Button variant="outline" size="sm">
              <Calculator className="w-4 h-4 mr-1" />
              Cálculo
            </Button>
          </Link>
          <Link href={`/cases/${caseId}/petition`}>
            <Button variant="outline" size="sm">
              <ScrollText className="w-4 h-4 mr-1" />
              Petição
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Case Info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold mb-4">Informações do Caso</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500 flex items-center gap-1 mb-1">
                  <Tag className="w-3 h-3" /> Tipo
                </dt>
                <dd className="font-medium">{TYPE_LABELS[caseData.caseType] || caseData.caseType}</dd>
              </div>
              <div>
                <dt className="text-gray-500 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3" /> Criado em
                </dt>
                <dd className="font-medium">{new Date(caseData.createdAt).toLocaleDateString("pt-BR")}</dd>
              </div>
              {"contractNumber" in caseData && caseData.contractNumber && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1 mb-1">
                    <Hash className="w-3 h-3" /> Nº Contrato
                  </dt>
                  <dd className="font-medium font-mono">{caseData.contractNumber as string}</dd>
                </div>
              )}
              {"contractDate" in caseData && caseData.contractDate && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Data Contrato
                  </dt>
                  <dd className="font-medium">{caseData.contractDate as string}</dd>
                </div>
              )}
              {"dueDate" in caseData && caseData.dueDate && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Vencimento
                  </dt>
                  <dd className="font-medium">{caseData.dueDate as string}</dd>
                </div>
              )}
              {"defaultDate" in caseData && caseData.defaultDate && (
                <div>
                  <dt className="text-gray-500 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Inadimplência
                  </dt>
                  <dd className="font-medium">{caseData.defaultDate as string}</dd>
                </div>
              )}
              {"caseNumber" in caseData && caseData.caseNumber && (
                <div className="col-span-2">
                  <dt className="text-gray-500 flex items-center gap-1 mb-1">
                    <Hash className="w-3 h-3" /> Nº Processo
                  </dt>
                  <dd className="font-medium font-mono">{caseData.caseNumber as string}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Financial Summary (if available) */}
          {"totalAmount" in caseData && caseData.totalAmount && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-base font-semibold mb-4">Resumo Financeiro</h2>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-gray-500 mb-1">Principal</dt>
                  <dd className="font-medium">{formatCurrency(caseData.principalAmount as string)}</dd>
                </div>
                {"correctionAmount" in caseData && (
                  <div>
                    <dt className="text-gray-500 mb-1">Correção Monetária</dt>
                    <dd className="font-medium">{formatCurrency(caseData.correctionAmount as string)}</dd>
                  </div>
                )}
                {"interestAmount" in caseData && (
                  <div>
                    <dt className="text-gray-500 mb-1">Juros Moratórios</dt>
                    <dd className="font-medium">{formatCurrency(caseData.interestAmount as string)}</dd>
                  </div>
                )}
                {"feesAmount" in caseData && (
                  <div>
                    <dt className="text-gray-500 mb-1">Honorários (10%)</dt>
                    <dd className="font-medium">{formatCurrency(caseData.feesAmount as string)}</dd>
                  </div>
                )}
                <div className="col-span-2 pt-3 border-t border-gray-200">
                  <dt className="text-gray-700 font-medium mb-1">Total Atualizado</dt>
                  <dd className="text-xl font-bold text-green-700">{formatCurrency(caseData.totalAmount as string)}</dd>
                </div>
              </dl>
            </div>
          )}

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-4">
            <Link href={`/cases/${caseId}/calculation`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Cálculo de Débito</p>
                    <p className="text-xs text-gray-500">Calcular e validar valor</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href={`/cases/${caseId}/petition`} className="block">
              <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-purple-300 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <ScrollText className="w-8 h-8 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Petição</p>
                    <p className="text-xs text-gray-500">Gerar e editar petição</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Timeline */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold mb-4">Pipeline</h2>
            <div className="space-y-2">
              {[
                { key: "received", label: "Recebido", date: "receivedAt" },
                { key: "analyzing", label: "Analisando", date: "analysisStartedAt" },
                { key: "extraction_complete", label: "Extração", date: "extractionCompletedAt" },
                { key: "validated", label: "Validado", date: "validationCompletedAt" },
                { key: "calculated", label: "Calculado", date: "calculationCompletedAt" },
                { key: "petition_generated", label: "Petição", date: "petitionGeneratedAt" },
                { key: "filed", label: "Protocolado", date: "filedAt" },
              ].map((step) => {
                const dateVal = (caseData as Record<string, unknown>)[step.date];
                const isDone = !!dateVal;
                const isCurrent = caseData.status === step.key;
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        isDone
                          ? isCurrent
                            ? "bg-blue-600"
                            : "bg-green-500"
                          : "bg-gray-200"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs ${isCurrent ? "font-semibold text-blue-700" : isDone ? "text-gray-700" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                    </div>
                    {isDone && (
                      <p className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(dateVal as string).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exceptions */}
          {caseData.status === "exception" && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                Exceção Ativa
              </div>
              <p className="text-xs text-red-600">
                Este caso possui uma exceção que bloqueia o pipeline.
              </p>
              <Link href="/exceptions">
                <Button variant="outline" size="sm" className="mt-3 w-full border-red-300 text-red-700 hover:bg-red-50">
                  Ver Exceções
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
