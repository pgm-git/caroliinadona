"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCw } from "lucide-react";

interface ImageViewerProps {
  url: string;
  title: string;
  className?: string;
}

export function ImageViewer({ url, title, className }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className={className}>
      <div className="mb-2 flex justify-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.25))}
          aria-label="Diminuir zoom"
        >
          <ZoomOut className="size-4" />
        </Button>
        <span className="flex items-center text-xs tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
          aria-label="Aumentar zoom"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRotation((r) => (r + 90) % 360)}
          aria-label="Rotacionar"
        >
          <RotateCw className="size-4" />
        </Button>
      </div>
      <div className="flex justify-center overflow-auto rounded-lg border bg-gray-50 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={title}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transformOrigin: "center center",
            transition: "transform 0.2s",
          }}
          className="max-w-full"
        />
      </div>
    </div>
  );
}
