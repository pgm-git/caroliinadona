"use client";

import { use } from "react";
import { ExtractionReview } from "@/components/extraction/extraction-review";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface ReviewPageProps {
  params: Promise<{ id: string; docId: string }>;
}

export default function ReviewPage({ params }: ReviewPageProps) {
  const { id: caseId, docId } = use(params);

  const { data, isLoading, refetch } =
    trpc.extraction.getByDocument.useQuery({ documentId: docId });

  const storagePath = data?.document?.storagePath ?? "";
  const signedUrlQuery = trpc.documents.getSignedUrl.useQuery(
    { storagePath },
    { enabled: !!storagePath }
  );

  const approveMutation = trpc.extraction.approve.useMutation({
    onSuccess: () => {
      toast.success("Extração aprovada com sucesso");
      refetch();
    },
    onError: () => toast.error("Erro ao aprovar extração"),
  });

  const reprocessMutation = trpc.extraction.reprocess.useMutation({
    onSuccess: () => {
      toast.success("Documento enviado para reprocessamento");
      refetch();
    },
    onError: () => toast.error("Erro ao reprocessar documento"),
  });

  const updateFieldMutation = trpc.extraction.updateField.useMutation({
    onSuccess: () => {
      toast.success("Campo atualizado");
      refetch();
    },
    onError: () => toast.error("Erro ao salvar campo"),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-sm text-gray-500">Carregando revisão...</p>
      </div>
    );
  }

  if (!data?.extraction || !data?.document) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2">
        <p className="text-sm text-gray-500">
          Nenhuma extração encontrada para este documento.
        </p>
        <Link
          href={`/cases/${caseId}`}
          className="text-sm text-[#2563EB] hover:underline"
        >
          Voltar ao caso
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href={`/cases/${caseId}`}
          className="flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="size-4" />
          Voltar ao caso
        </Link>
        <span className="text-sm text-gray-300">/</span>
        <h1 className="text-lg font-bold">
          Revisão: {data.document.originalFilename ?? data.document.title}
        </h1>
      </div>

      <ExtractionReview
        extraction={{
          id: data.extraction.id,
          confidenceScore: data.extraction.confidenceScore,
          extractedFields: data.extraction.extractedFields as Record<
            string,
            unknown
          >,
          extractionModel: data.extraction.extractionModel,
          isApproved: data.extraction.isApproved,
          createdAt: data.extraction.createdAt,
        }}
        document={{
          id: data.document.id,
          title: data.document.title,
          mimeType: data.document.mimeType,
          documentType: data.document.documentType,
          aiClassification: data.document.aiClassification,
          aiConfidence: data.document.aiConfidence,
        }}
        documentUrl={signedUrlQuery.data?.url ?? ""}
        parties={data.parties.map((p) => ({
          id: p.id,
          role: p.role,
          personType: p.personType,
          fullName: p.fullName,
          cpf: p.cpf,
          cnpj: p.cnpj,
          isPrimary: p.isPrimary,
          addressStreet: p.addressStreet,
        }))}
        onApprove={() =>
          approveMutation.mutate({
            extractedDataId: data.extraction!.id,
          })
        }
        onReprocess={() =>
          reprocessMutation.mutate({ documentId: docId })
        }
        onSaveField={(fieldPath, newValue) =>
          updateFieldMutation.mutate({
            extractedDataId: data.extraction!.id,
            fieldPath,
            newValue,
          })
        }
        isApproving={approveMutation.isPending}
        isReprocessing={reprocessMutation.isPending}
        isSaving={updateFieldMutation.isPending}
      />
    </div>
  );
}
