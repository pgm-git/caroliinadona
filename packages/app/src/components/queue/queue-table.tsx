"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  MoreHorizontal,
  RotateCcw,
  ExternalLink,
  Download,
} from "lucide-react";
import { formatFileSize } from "@/lib/upload/constants";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  title: string | null;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  documentType: string | null;
  isProcessed: boolean;
  processingStartedAt: Date | string | null;
  processingCompletedAt: Date | string | null;
  processingError: string | null;
  createdAt: Date | string;
  caseId: string;
  caseReference: string | null;
}

interface QueueTableProps {
  items: QueueItem[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onReprocess: (documentId: string) => void;
  isReprocessing?: boolean;
}

type DocStatus = "pending" | "processing" | "completed" | "error";

function getStatus(item: QueueItem): DocStatus {
  if (item.processingError) return "error";
  if (item.isProcessed) return "completed";
  if (item.processingStartedAt) return "processing";
  return "pending";
}

const STATUS_CONFIG: Record<
  DocStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; pulse?: boolean }
> = {
  pending: { label: "Recebido", variant: "secondary" },
  processing: { label: "Em Processamento", variant: "default", pulse: true },
  completed: { label: "Processado", variant: "outline" },
  error: { label: "Erro", variant: "destructive" },
};

const DOC_TYPE_LABELS: Record<string, string> = {
  credit_certificate: "Certidão de Crédito",
  contract: "Contrato",
  guarantee: "Garantia",
  promissory_note: "Nota Promissória",
  check: "Cheque",
  court_order: "Decisão Judicial",
  petition: "Petição",
  power_of_attorney: "Procuração",
  identification: "Identificação",
  proof_of_address: "Comprovante Endereço",
  financial_statement: "Extrato Financeiro",
  other: "Outro",
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

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return <FileText className="size-4 text-red-500" />;
  }
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="size-4 text-blue-500" />;
  }
  return <FileText className="size-4 text-gray-400" />;
}

function StatusBadge({ status }: { status: DocStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge
      variant={config.variant}
      className={cn(config.pulse && "animate-pulse")}
    >
      {config.label}
    </Badge>
  );
}

export function QueueTable({
  items,
  total,
  page,
  totalPages,
  onPageChange,
  onReprocess,
  isReprocessing,
}: QueueTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg font-medium">Nenhum documento na fila</p>
        <p className="mt-1 text-sm">
          Documentos enviados aparecerão aqui para processamento.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Documento</TableHead>
            <TableHead>Caso</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Enviado em</TableHead>
            <TableHead>Tamanho</TableHead>
            <TableHead className="w-[60px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const status = getStatus(item);
            return (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <FileTypeIcon mimeType={item.mimeType} />
                    <span className="max-w-[200px] truncate text-sm font-medium">
                      {item.originalFilename}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {item.caseReference ? (
                    <Link
                      href={`/cases/${item.caseId}`}
                      className="font-mono text-xs text-[#2563EB] hover:underline"
                    >
                      {item.caseReference}
                    </Link>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.documentType ? (
                    <Badge variant="secondary" className="text-xs">
                      {DOC_TYPE_LABELS[item.documentType] ?? item.documentType}
                    </Badge>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge status={status} />
                </TableCell>
                <TableCell className="text-xs text-gray-500">
                  {formatDateTime(item.createdAt)}
                </TableCell>
                <TableCell className="text-xs text-gray-500 tabular-nums">
                  {formatFileSize(item.fileSizeBytes)}
                </TableCell>
                <TableCell>
                  <ActionMenu
                    item={item}
                    status={status}
                    onReprocess={onReprocess}
                    isReprocessing={isReprocessing}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {total} documento{total !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActionMenu({
  item,
  status,
  onReprocess,
  isReprocessing,
}: {
  item: QueueItem;
  status: DocStatus;
  onReprocess: (documentId: string) => void;
  isReprocessing?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setOpen(!open)}
        aria-label="Ações"
      >
        <MoreHorizontal className="size-4" />
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border bg-white py-1 shadow-lg">
            <Link
              href={`/cases/${item.caseId}`}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="size-3.5" />
              Ver Caso
            </Link>

            {status === "error" && (
              <button
                onClick={() => {
                  onReprocess(item.id);
                  setOpen(false);
                }}
                disabled={isReprocessing}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-orange-600 hover:bg-gray-50 disabled:opacity-50"
              >
                <RotateCcw className="size-3.5" />
                Reprocessar
              </button>
            )}

            <a
              href="#"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
              onClick={(e) => {
                e.preventDefault();
                setOpen(false);
              }}
            >
              <Download className="size-3.5" />
              Download
            </a>
          </div>
        </>
      )}
    </div>
  );
}
