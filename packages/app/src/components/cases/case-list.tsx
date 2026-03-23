"use client";

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
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { cases } from "@/server/db/schema";

type CaseRecord = typeof cases.$inferSelect;

interface CaseListProps {
  items: CaseRecord[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  received: { label: "Recebido", variant: "secondary" },
  analyzing: { label: "Em Análise", variant: "default" },
  extraction_complete: { label: "Extração Completa", variant: "default" },
  validated: { label: "Validado", variant: "default" },
  calculated: { label: "Calculado", variant: "default" },
  petition_generated: { label: "Petição Gerada", variant: "default" },
  reviewed: { label: "Revisado", variant: "outline" },
  filed: { label: "Protocolado", variant: "outline" },
  exception: { label: "Exceção", variant: "destructive" },
};

const TYPE_LABELS: Record<string, string> = {
  execution: "Execução",
  collection: "Cobrança",
};

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CaseList({
  items,
  total,
  page,
  totalPages,
  onPageChange,
}: CaseListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-lg font-medium">Nenhum caso encontrado</p>
        <p className="mt-1 text-sm">
          Crie um novo caso para começar.
        </p>
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Referência</TableHead>
            <TableHead>Título</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioridade</TableHead>
            <TableHead>Criado em</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((caseItem) => {
            const statusInfo = STATUS_LABELS[caseItem.status] ?? {
              label: caseItem.status,
              variant: "secondary" as const,
            };
            return (
              <TableRow key={caseItem.id}>
                <TableCell>
                  <Link
                    href={`/cases/${caseItem.id}`}
                    className="font-mono text-sm text-[#2563EB] hover:underline"
                  >
                    {caseItem.internalReference}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[300px] truncate font-medium">
                  {caseItem.title}
                </TableCell>
                <TableCell>
                  {TYPE_LABELS[caseItem.caseType] ?? caseItem.caseType}
                </TableCell>
                <TableCell>
                  <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                </TableCell>
                <TableCell>{caseItem.priority}</TableCell>
                <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {total} caso{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
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
