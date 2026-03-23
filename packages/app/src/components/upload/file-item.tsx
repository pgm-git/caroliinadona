"use client";

import { FileText, Image, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/upload/constants";
import type { UploadFile } from "@/hooks/use-file-upload";

interface FileItemProps {
  file: UploadFile;
  onRemove: (id: string) => void;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType === "application/pdf") {
    return <FileText className="size-8 shrink-0 text-gray-500" />;
  }
  return <Image className="size-8 shrink-0 text-gray-500" />;
}

function StatusBadge({ file }: { file: UploadFile }) {
  if (!file.validationResult.valid) {
    return (
      <Badge variant="destructive">
        <AlertCircle className="size-3" />
        Rejeitado
      </Badge>
    );
  }

  switch (file.status) {
    case "pending":
      return <Badge variant="secondary">Pendente</Badge>;
    case "uploading":
      return (
        <Badge className="bg-[#2563EB]/10 text-[#2563EB]">
          <Loader2 className="size-3 animate-spin" />
          Enviando
        </Badge>
      );
    case "success":
      return (
        <Badge className="bg-[#059669]/10 text-[#059669]">
          <CheckCircle className="size-3" />
          Enviado
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive">
          <AlertCircle className="size-3" />
          Erro
        </Badge>
      );
  }
}

export function FileItem({ file, onRemove }: FileItemProps) {
  const errorMessage =
    file.validationResult.error ?? file.error;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border p-3",
        !file.validationResult.valid && "border-red-200 bg-red-50",
        file.status === "success" && "border-green-200 bg-green-50",
        file.status === "error" && "border-red-200 bg-red-50"
      )}
      aria-live="polite"
    >
      <FileIcon mimeType={file.file.type} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {file.file.name}
          </p>
          <StatusBadge file={file} />
        </div>

        <p className="text-xs text-gray-500">
          {formatFileSize(file.file.size)}
        </p>

        {errorMessage && (
          <p className="mt-1 text-xs text-red-600">{errorMessage}</p>
        )}

        {file.status === "uploading" && (
          <div className="mt-2">
            <Progress value={file.progress} />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(file.id)}
        aria-label={`Remover arquivo ${file.file.name}`}
        className="shrink-0"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
