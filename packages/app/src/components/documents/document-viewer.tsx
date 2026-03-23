"use client";

import { PdfViewer } from "./pdf-viewer";
import { ImageViewer } from "./image-viewer";

interface DocumentViewerProps {
  url: string;
  mimeType: string;
  title: string;
  className?: string;
}

export function DocumentViewer({
  url,
  mimeType,
  title,
  className,
}: DocumentViewerProps) {
  if (mimeType === "application/pdf") {
    return <PdfViewer url={url} title={title} className={className} />;
  }

  if (mimeType.startsWith("image/")) {
    return <ImageViewer url={url} title={title} className={className} />;
  }

  return (
    <div className="flex min-h-[200px] items-center justify-center rounded-lg border bg-gray-50 p-8">
      <p className="text-sm text-gray-500">
        Visualização não disponível para este tipo de arquivo.
      </p>
    </div>
  );
}
