"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CaseForm, type CaseFormData } from "@/components/cases/case-form";
import { FileUploader } from "@/components/upload/file-uploader";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export default function NewCasePage() {
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const createMutation = trpc.cases.create.useMutation({
    onSuccess: (newCase) => {
      toast.success(`Caso ${newCase.internalReference} criado com sucesso!`);
      router.push(`/cases/${newCase.id}`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar caso: ${error.message}`);
    },
  });

  async function handleSubmit(data: CaseFormData) {
    // In demo mode the router handles the mock. In production it creates in the DB.
    // File upload is handled separately via storage service (not implemented here yet).
    void selectedFiles;
    createMutation.mutate({
      title: data.title,
      caseType: data.caseType,
      description: data.description,
      priority: data.priority ?? 3,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Novo Caso</h1>
        <p className="text-sm text-gray-500">
          Preencha os dados e anexe os documentos
        </p>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Dados do Caso</h2>
        <CaseForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Documentos</h2>
        <FileUploader
          onFilesReady={(files) => setSelectedFiles(files)}
          disabled={createMutation.isPending}
        />
      </Card>
    </div>
  );
}
