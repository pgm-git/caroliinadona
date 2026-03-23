"use client";

import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  Columns2,
} from "lucide-react";

interface PdfControlsProps {
  currentPage: number;
  numPages: number;
  zoom: number;
  isFullscreen: boolean;
  showThumbnails: boolean;
  onPageChange: (page: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onToggleFullscreen: () => void;
  onToggleThumbnails: () => void;
}

export function PdfControls({
  currentPage,
  numPages,
  zoom,
  isFullscreen,
  showThumbnails,
  onPageChange,
  onZoomIn,
  onZoomOut,
  onRotate,
  onToggleFullscreen,
  onToggleThumbnails,
}: PdfControlsProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border bg-white p-1 shadow-sm">
      {/* Pagination */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[60px] text-center text-sm tabular-nums">
        {currentPage} / {numPages}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= numPages}
        aria-label="Próxima página"
      >
        <ChevronRight className="size-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Zoom */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomOut}
        disabled={zoom <= 0.25}
        aria-label="Diminuir zoom"
      >
        <ZoomOut className="size-4" />
      </Button>
      <span className="min-w-[40px] text-center text-xs tabular-nums">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onZoomIn}
        disabled={zoom >= 2}
        aria-label="Aumentar zoom"
      >
        <ZoomIn className="size-4" />
      </Button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Rotate */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onRotate}
        aria-label="Rotacionar"
      >
        <RotateCw className="size-4" />
      </Button>

      {/* Thumbnails */}
      <Button
        variant={showThumbnails ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={onToggleThumbnails}
        aria-label="Miniaturas"
      >
        <Columns2 className="size-4" />
      </Button>

      {/* Fullscreen */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onToggleFullscreen}
        aria-label={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      >
        {isFullscreen ? (
          <Minimize className="size-4" />
        ) : (
          <Maximize className="size-4" />
        )}
      </Button>
    </div>
  );
}
