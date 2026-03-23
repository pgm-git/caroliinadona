"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Download, Clock } from "lucide-react";
import { formatFileSize } from "@/lib/upload/constants";

interface CaseDocument {
  id: string;
  title: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  isProcessed: boolean;
  processingError: string | null;
  createdAt: Date | string;
  storagePath: string;
}

interface StatusHistoryItem {
  id: string;
  previousStatus: string;
  newStatus: string;
  reason: string | null;
  changedAt: Date | string;
}

interface CaseDetailProps {
  caseData: {
    id: string;
    title: string;
    internalReference: string;
    caseType: string;
    status: string;
    priority: number;
    description: string | null;
    createdAt: Date | string;
  };
  documents: CaseDocument[];
  statusHistory: StatusHistoryItem[];
  onDownload: (storagePath: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  received: "Recebido",
  analyzing: "Em Análise",
  extraction_complete: "Extração Completa",
  validated: "Validado",
  calculated: "Calculado",
  petition_generated: "Petição Gerada",
  reviewed: "Revisado",
  filed: "Protocolado",
  exception: "Exceção",
};

function formatDateTime(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CaseDetail({
  caseData,
  documents,
  statusHistory,
  onDownload,
}: CaseDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{caseData.title}</h1>
          <Badge>{STATUS_LABELS[caseData.status] ?? caseData.status}</Badge>
        </div>
        <p className="mt-1 font-mono text-sm text-gray-500">
          {caseData.internalReference}
        </p>
        {caseData.description && (
          <p className="mt-2 text-sm text-gray-600">{caseData.description}</p>
        )}
      </div>

      {/* Documents */}
      <Card className="p-4">
        <h2 className="mb-3 text-lg font-semibold">
          Documentos ({documents.length})
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhum documento anexado.</p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <FileText className="size-6 shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {doc.originalFilename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(doc.fileSizeBytes)} —{" "}
                    {doc.isProcessed ? (
                      <span className="text-[#059669]">Processado</span>
                    ) : doc.processingError ? (
                      <span className="text-red-600">Erro</span>
                    ) : (
                      <span className="text-gray-400">Pendente</span>
                    )}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDownload(doc.storagePath)}
                  aria-label={`Download ${doc.originalFilename}`}
                >
                  <Download className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Timeline */}
      <Card className="p-4">
        <h2 className="mb-3 text-lg font-semibold">Histórico</h2>
        {statusHistory.length === 0 ? (
          <p className="text-sm text-gray-500">Sem histórico.</p>
        ) : (
          <div className="space-y-3">
            {statusHistory.map((item) => (
              <div key={item.id} className="flex gap-3">
                <Clock className="mt-0.5 size-4 shrink-0 text-gray-400" />
                <div>
                  <p className="text-sm">
                    {item.previousStatus ? (
                      <>
                        {STATUS_LABELS[item.previousStatus] ?? item.previousStatus}
                        {" → "}
                      </>
                    ) : null}
                    <span className="font-medium">
                      {STATUS_LABELS[item.newStatus] ?? item.newStatus}
                    </span>
                  </p>
                  {item.reason && (
                    <p className="text-xs text-gray-500">{item.reason}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {formatDateTime(item.changedAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
