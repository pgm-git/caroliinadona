"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import { ConfidenceBadge } from "./confidence-badge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditableFieldProps {
  label: string;
  value: string | number | null;
  confidence: number;
  manuallyEdited?: boolean;
  onSave: (newValue: string) => void;
  isSaving?: boolean;
}

export function EditableField({
  label,
  value,
  confidence,
  manuallyEdited,
  onSave,
  isSaving,
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value ?? ""));
  const isLowConfidence = confidence < 80;

  if (editing) {
    return (
      <div
        className={cn(
          "rounded-lg border p-3",
          isLowConfidence ? "border-red-200 bg-red-50/50" : "border-border"
        )}
      >
        <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              onSave(draft);
              setEditing(false);
            }}
            disabled={isSaving}
          >
            <Check className="size-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setDraft(String(value ?? ""));
              setEditing(false);
            }}
          >
            <X className="size-4 text-gray-400" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group rounded-lg border p-3 transition-colors",
        isLowConfidence
          ? "border-red-200 bg-red-50/50"
          : "border-border hover:border-gray-300"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <div className="flex items-center gap-1.5">
          {manuallyEdited && (
            <Badge variant="secondary" className="text-[10px]">
              Corrigido
            </Badge>
          )}
          <ConfidenceBadge score={confidence} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100"
            aria-label={`Editar ${label}`}
          >
            <Pencil className="size-3" />
          </Button>
        </div>
      </div>
      <p className="mt-1 text-sm font-medium">
        {value !== null && value !== undefined ? (
          String(value)
        ) : (
          <span className="text-gray-400">Não detectado</span>
        )}
      </p>
    </div>
  );
}
