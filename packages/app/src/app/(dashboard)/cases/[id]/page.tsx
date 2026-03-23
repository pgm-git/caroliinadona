"use client";

import { useParams } from "next/navigation";
import { CaseDetail } from "@/components/cases/case-detail";
import { toast } from "sonner";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();

  // TODO: Replace with trpc.cases.getById.useQuery when auth is connected
  const mockCase = {
    id: params.id,
    title: "Carregando...",
    internalReference: "—",
    caseType: "execution",
    status: "received",
    priority: 3,
    description: null,
    createdAt: new Date(),
  };

  async function handleDownload(storagePath: string) {
    try {
      // TODO: Use trpc.documents.getSignedUrl
      void storagePath;
      toast.info("Download iniciado");
    } catch {
      toast.error("Erro ao gerar link de download");
    }
  }

  return (
    <CaseDetail
      caseData={mockCase}
      documents={[]}
      statusHistory={[]}
      onDownload={handleDownload}
    />
  );
}
