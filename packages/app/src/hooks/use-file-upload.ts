"use client";

import { useState, useCallback, useMemo } from "react";
import {
  validateFile,
  validateFileCount,
  type FileValidationResult,
} from "@/lib/upload/file-validation";

export interface UploadFile {
  id: string;
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  validationResult: FileValidationResult;
}

export interface UseFileUploadReturn {
  files: UploadFile[];
  addFiles: (files: FileList | File[]) => string | null;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  validFiles: UploadFile[];
  invalidFiles: UploadFile[];
  isUploading: boolean;
  uploadFiles: (
    onUpload: (
      file: File,
      onProgress: (pct: number) => void
    ) => Promise<string>
  ) => Promise<void>;
}

let fileIdCounter = 0;
function generateFileId(): string {
  fileIdCounter++;
  return `file-${Date.now()}-${fileIdCounter}`;
}

export function useFileUpload(): UseFileUploadReturn {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const addFiles = useCallback(
    (newFiles: FileList | File[]): string | null => {
      const fileArray = Array.from(newFiles);

      const countResult = validateFileCount(files.length, fileArray.length);
      if (!countResult.valid) {
        return countResult.error ?? "Erro de validação";
      }

      const uploadFiles: UploadFile[] = fileArray.map((file) => ({
        id: generateFileId(),
        file,
        status: "pending" as const,
        progress: 0,
        validationResult: validateFile(file),
      }));

      setFiles((prev) => [...prev, ...uploadFiles]);
      return null;
    },
    [files.length]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const validFiles = useMemo(
    () => files.filter((f) => f.validationResult.valid),
    [files]
  );

  const invalidFiles = useMemo(
    () => files.filter((f) => !f.validationResult.valid),
    [files]
  );

  const isUploading = useMemo(
    () => files.some((f) => f.status === "uploading"),
    [files]
  );

  const uploadFiles = useCallback(
    async (
      onUpload: (
        file: File,
        onProgress: (pct: number) => void
      ) => Promise<string>
    ) => {
      const toUpload = files.filter(
        (f) => f.validationResult.valid && f.status === "pending"
      );

      for (const uploadFile of toUpload) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "uploading" as const, progress: 0 }
              : f
          )
        );

        try {
          await onUpload(uploadFile.file, (pct: number) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === uploadFile.id ? { ...f, progress: pct } : f
              )
            );
          });

          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "success" as const, progress: 100 }
                : f
            )
          );
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Erro ao enviar arquivo";
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadFile.id
                ? { ...f, status: "error" as const, error: errorMessage }
                : f
            )
          );
        }
      }
    },
    [files]
  );

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    validFiles,
    invalidFiles,
    isUploading,
    uploadFiles,
  };
}
