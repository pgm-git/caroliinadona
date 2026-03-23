"use client";

import { useState } from "react";
import { QueueSummary } from "@/components/queue/queue-summary";
import { QueueFilters } from "@/components/queue/queue-filters";
import { QueueTable } from "@/components/queue/queue-table";
import { useQueuePolling } from "@/hooks/use-queue-polling";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

export default function QueuePage() {
  const [status, setStatus] = useState<
    "all" | "pending" | "processing" | "completed" | "error"
  >("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);

  const {
    items,
    total,
    totalPages,
    summary,
    isLoading,
    lastUpdated,
  } = useQueuePolling({
    filters: {
      page,
      pageSize: 20,
      status,
      sortOrder,
    },
  });

  const reprocessMutation = trpc.queue.reprocess.useMutation({
    onSuccess: () => {
      toast.success("Documento reenviado para processamento");
    },
    onError: () => {
      toast.error("Erro ao reprocessar documento");
    },
  });

  function handleStatusChange(
    newStatus: "all" | "pending" | "processing" | "completed" | "error"
  ) {
    setStatus(newStatus);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fila de Entrada</h1>
        <p className="text-sm text-gray-500">
          Acompanhe o processamento dos documentos recebidos.
        </p>
      </div>

      <QueueSummary
        total={summary.total}
        pending={summary.pending}
        processing={summary.processing}
        completed={summary.completed}
        errors={summary.errors}
        activeFilter={status}
        onFilterChange={handleStatusChange}
      />

      <QueueFilters
        status={status}
        onStatusChange={handleStatusChange}
        sortOrder={sortOrder}
        onSortOrderChange={(order) => {
          setSortOrder(order);
          setPage(1);
        }}
        lastUpdated={lastUpdated}
      />

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-sm">Carregando fila...</p>
        </div>
      ) : (
        <QueueTable
          items={items}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onReprocess={(documentId) =>
            reprocessMutation.mutate({ documentId })
          }
          isReprocessing={reprocessMutation.isPending}
        />
      )}
    </div>
  );
}
