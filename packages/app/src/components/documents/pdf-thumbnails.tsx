"use client";

import { Document, Page, pdfjs } from "react-pdf";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfThumbnailsProps {
  url: string;
  numPages: number;
  currentPage: number;
  onPageSelect: (page: number) => void;
}

export function PdfThumbnails({
  url,
  numPages,
  currentPage,
  onPageSelect,
}: PdfThumbnailsProps) {
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-2 overflow-y-auto p-2">
      <Document file={url} loading={null}>
        {pages.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageSelect(pageNum)}
            className={cn(
              "relative rounded border-2 p-0.5 transition-colors",
              pageNum === currentPage
                ? "border-[#2563EB]"
                : "border-transparent hover:border-gray-300"
            )}
            aria-label={`Página ${pageNum}`}
          >
            <Page
              pageNumber={pageNum}
              width={120}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
            <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1 text-[10px] text-white">
              {pageNum}
            </span>
          </button>
        ))}
      </Document>
    </div>
  );
}
