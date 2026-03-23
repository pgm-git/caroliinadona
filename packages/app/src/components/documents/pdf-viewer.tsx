"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { PdfControls } from "./pdf-controls";
import { PdfThumbnails } from "./pdf-thumbnails";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  url: string;
  title: string;
  className?: string;
}

export function PdfViewer({ url, title, className }: PdfViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function onLoadSuccess({ numPages: n }: { numPages: number }) {
    setNumPages(n);
    setLoadError(null);
  }

  function onLoadError() {
    setLoadError(
      "Não foi possível abrir o documento. O arquivo pode estar corrompido."
    );
  }

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= numPages) {
        setCurrentPage(page);
      }
    },
    [numPages]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.25, 2));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.25, 0.25));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation((r) => (r + 90) % 360);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case "ArrowRight":
        case "PageDown":
          e.preventDefault();
          handlePageChange(currentPage + 1);
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          handlePageChange(currentPage - 1);
          break;
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          setZoom(1);
          break;
        case "r":
        case "R":
          e.preventDefault();
          handleRotate();
          break;
        case "f":
        case "F":
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case "t":
        case "T":
          e.preventDefault();
          setShowThumbnails((v) => !v);
          break;
        case "Home":
          e.preventDefault();
          handlePageChange(1);
          break;
        case "End":
          e.preventDefault();
          handlePageChange(numPages);
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, numPages, handlePageChange, handleZoomIn, handleZoomOut, handleRotate, handleToggleFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (loadError) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-lg border bg-gray-50 p-8 text-center">
        <p className="text-sm text-red-600">{loadError}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col rounded-lg border bg-gray-100",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Controls */}
      {numPages > 0 && (
        <div className="flex justify-center border-b bg-white p-2">
          <PdfControls
            currentPage={currentPage}
            numPages={numPages}
            zoom={zoom}
            isFullscreen={isFullscreen}
            showThumbnails={showThumbnails}
            onPageChange={handlePageChange}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRotate={handleRotate}
            onToggleFullscreen={handleToggleFullscreen}
            onToggleThumbnails={() => setShowThumbnails((v) => !v)}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails sidebar */}
        {showThumbnails && numPages > 0 && (
          <div className="w-[140px] shrink-0 border-r bg-white">
            <PdfThumbnails
              url={url}
              numPages={numPages}
              currentPage={currentPage}
              onPageSelect={handlePageChange}
            />
          </div>
        )}

        {/* Main page */}
        <div className="flex flex-1 items-start justify-center overflow-auto p-4">
          <Document
            file={url}
            onLoadSuccess={onLoadSuccess}
            onLoadError={onLoadError}
            loading={
              <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-gray-500">Carregando {title}...</p>
              </div>
            }
          >
            <Page
              pageNumber={currentPage}
              scale={zoom}
              rotate={rotation}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>
      </div>
    </div>
  );
}
