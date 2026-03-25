"use client";

/**
 * Editor Tiptap para edição manual de petições.
 * Permite formatação jurídica, salva mudanças no DB.
 *
 * Deps required: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-text-align
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

interface PetitionEditorProps {
  petitionId: string;
  initialContent: string;
  onSave?: (content: string) => void;
}

/**
 * Placeholder component para o editor.
 * Será implementado com Tiptap após instalar dependências.
 */
export function PetitionEditor({
  petitionId,
  initialContent,
  onSave,
}: PetitionEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState(initialContent);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = trpc.petition.updateContent.useMutation({
    onSuccess: () => {
      setHasChanges(false);
      toast.success("Petição salva com sucesso!");
      onSave?.(content);
    },
    onError: () => {
      toast.error("Erro ao salvar petição");
    },
    onSettled: () => {
      setIsSaving(false);
    },
  });

  const handleSave = useCallback(async () => {
    if (!hasChanges) return;

    setIsSaving(true);
    updateMutation.mutate({
      petitionId,
      contentHtml: content,
    });
  }, [content, hasChanges, petitionId, updateMutation]);

  // Salvar automaticamente com debounce (3 segundos)
  useEffect(() => {
    if (!hasChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasChanges, handleSave]);

  return (
    <div className="petition-editor-wrapper">
      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        <span className="text-sm text-gray-500">
          Editor Tiptap será implementado após instalar dependências
        </span>
        <div className="flex-1" />
        <Button
          size="sm"
          variant={hasChanges ? "default" : "outline"}
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          title={hasChanges ? "Salvar agora" : "Sem mudanças"}
        >
          {isSaving ? "Salvando..." : hasChanges ? "Salvar" : "Salvo"}
        </Button>
      </div>

      {/* Editor Textarea Placeholder */}
      <div className="petition-editor-container border border-gray-200 rounded-md bg-white dark:bg-slate-950 p-4">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setHasChanges(true);
          }}
          placeholder="Editor Tiptap com formatação jurídica (em desenvolvimento)"
          className="w-full h-96 font-serif text-base leading-relaxed p-2 border-none focus:outline-none resize-none"
        />
      </div>

      {/* Status */}
      {hasChanges && (
        <div className="mt-2 text-sm text-amber-600">
          Mudanças detectadas. Auto-salvando em 3 segundos...
        </div>
      )}
    </div>
  );
}
