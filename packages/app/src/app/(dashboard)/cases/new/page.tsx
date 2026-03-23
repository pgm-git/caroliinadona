"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { CaseForm, type CaseFormData } from "@/components/cases/case-form";
import { FileUploader } from "@/components/upload/file-uploader";
import { toast } from "sonner";
import { useState } from "react";

export default function NewCasePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  async function handleSubmit(data: CaseFormData) {
    setIsLoading(true);
    try {
      // TODO: Replace with tRPC mutation when auth is connected
      // 1. Create case via trpc.cases.create.mutate(data)
      // 2. Upload documents via storageService
      // 3. Enqueue processing via trpc.cases.enqueueProcessing.mutate(...)
      void data;
      void selectedFiles;
      toast.success("Caso criado com sucesso!");
      router.push("/cases");
    } catch {
      toast.error("Erro ao criar caso. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
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
        <CaseForm onSubmit={handleSubmit} isLoading={isLoading} />
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Documentos</h2>
        <FileUploader
          onFilesReady={(files) => setSelectedFiles(files)}
          disabled={isLoading}
        />
      </Card>
    </div>
  );
}
