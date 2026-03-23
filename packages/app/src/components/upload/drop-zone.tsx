"use client";

import { useState, useRef, useCallback } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { UPLOAD_CONFIG } from "@/lib/upload/constants";

interface DropZoneProps {
  onFiles: (files: FileList) => void;
  disabled?: boolean;
  className?: string;
}

export function DropZone({ onFiles, disabled = false, className }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounter.current++;
      setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);
      if (disabled) return;

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFiles(e.dataTransfer.files);
      }
    },
    [disabled, onFiles]
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
    [disabled]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFiles(e.target.files);
        // Reset input so the same file can be selected again
        e.target.value = "";
      }
    },
    [onFiles]
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Arraste arquivos ou clique para selecionar"
      aria-disabled={disabled}
      className={cn(
        "relative flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragOver
          ? "border-[#2563EB] bg-blue-50"
          : "border-gray-300 hover:border-gray-400",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <Upload
        className={cn(
          "mb-3 size-10",
          isDragOver ? "text-[#2563EB]" : "text-[#1E3A5F]"
        )}
      />
      <p className="text-sm font-medium text-gray-700">
        {isDragOver
          ? "Solte os arquivos aqui"
          : "Arraste arquivos ou clique para selecionar"}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        PDF, JPG, PNG ou TIFF — Máximo 25 MB por arquivo
      </p>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={UPLOAD_CONFIG.acceptString}
        className="hidden"
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
        disabled={disabled}
      />
    </div>
  );
}
