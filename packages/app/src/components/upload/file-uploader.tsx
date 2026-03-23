"use client";

import { useCallback } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/use-file-upload";
import { DropZone } from "./drop-zone";
import { FileItem } from "./file-item";
import { toast } from "sonner";

interface FileUploaderProps {
  onFilesReady?: (files: File[]) => void;
  onUpload?: (
    file: File,
    onProgress: (pct: number) => void
  ) => Promise<string>;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUploader({
  onFilesReady,
  onUpload,
  disabled = false,
  className,
}: FileUploaderProps) {
  const {
    files,
    addFiles,
    removeFile,
    clearFiles,
    validFiles,
    isUploading,
    uploadFiles,
  } = useFileUpload();

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const error = addFiles(fileList);
      if (error) {
        toast.error(error);
      }
    },
    [addFiles]
  );

  const handleUpload = useCallback(async () => {
    if (onUpload) {
      await uploadFiles(onUpload);
    }
    if (onFilesReady && validFiles.length > 0) {
      onFilesReady(validFiles.map((f) => f.file));
    }
  }, [onUpload, uploadFiles, onFilesReady, validFiles]);

  return (
    <div className={cn("space-y-4", className)}>
      <DropZone
        onFiles={handleFiles}
        disabled={disabled || isUploading}
      />

      {files.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {validFiles.length} arquivo{validFiles.length !== 1 ? "s" : ""}{" "}
              válido{validFiles.length !== 1 ? "s" : ""}
              {files.length !== validFiles.length && (
                <span className="text-red-600">
                  {" "}
                  — {files.length - validFiles.length} rejeitado
                  {files.length - validFiles.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              <Trash2 className="size-4" />
              Limpar
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <FileItem key={file.id} file={file} onRemove={removeFile} />
            ))}
          </div>

          {(onUpload || onFilesReady) && validFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              disabled={disabled || isUploading || validFiles.length === 0}
              className="w-full"
            >
              {isUploading
                ? "Enviando..."
                : `Enviar ${validFiles.length} arquivo${validFiles.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
