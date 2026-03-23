"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";

interface QueueFilters {
  page: number;
  pageSize: number;
  status: "all" | "pending" | "processing" | "completed" | "error";
  sortOrder: "asc" | "desc";
}

interface UseQueuePollingOptions {
  interval?: number;
  enabled?: boolean;
  filters: QueueFilters;
}

export function useQueuePolling({
  interval = 5000,
  enabled = true,
  filters,
}: UseQueuePollingOptions) {
  const prevItemsRef = useRef<Map<string, string>>(new Map());

  const listQuery = trpc.queue.list.useQuery(filters, {
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: false,
  });

  const summaryQuery = trpc.queue.summary.useQuery(undefined, {
    refetchInterval: enabled ? interval : false,
    refetchIntervalInBackground: false,
  });

  // Track status changes for toast notifications
  useEffect(() => {
    if (!listQuery.data?.items) return;

    const currentItems = new Map<string, string>();
    for (const item of listQuery.data.items) {
      const status = getDocumentStatus(item);
      currentItems.set(item.id, status);
    }

    // Compare with previous state
    if (prevItemsRef.current.size > 0) {
      for (const [id, newStatus] of currentItems) {
        const oldStatus = prevItemsRef.current.get(id);
        if (oldStatus && oldStatus !== newStatus) {
          const item = listQuery.data.items.find((i) => i.id === id);
          const name = item?.originalFilename ?? "Documento";

          if (newStatus === "completed") {
            toast.success(`"${name}" processado com sucesso`);
          } else if (newStatus === "error") {
            toast.error(`Erro ao processar "${name}"`);
          }
        }
      }
    }

    prevItemsRef.current = currentItems;
  }, [listQuery.data]);

  // Use dataUpdatedAt from react-query to track last update time
  const lastUpdated = new Date(listQuery.dataUpdatedAt);

  return {
    items: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    page: listQuery.data?.page ?? 1,
    totalPages: listQuery.data?.totalPages ?? 1,
    summary: summaryQuery.data ?? {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      errors: 0,
    },
    isLoading: listQuery.isLoading,
    error: listQuery.error,
    lastUpdated,
  };
}

function getDocumentStatus(item: {
  isProcessed: boolean;
  processingStartedAt: Date | string | null;
  processingError: string | null;
}): string {
  if (item.processingError) return "error";
  if (item.isProcessed) return "completed";
  if (item.processingStartedAt) return "processing";
  return "pending";
}
