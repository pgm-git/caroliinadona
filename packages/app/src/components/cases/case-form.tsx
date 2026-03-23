"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CaseFormProps {
  onSubmit: (data: CaseFormData) => void;
  isLoading?: boolean;
}

export interface CaseFormData {
  title: string;
  caseType: "execution" | "collection";
  description: string;
  priority: number;
}

const TYPE_OPTIONS = [
  { value: "execution", label: "Execução de Título Extrajudicial" },
  { value: "collection", label: "Ação de Cobrança" },
];

export function CaseForm({ onSubmit, isLoading = false }: CaseFormProps) {
  const [title, setTitle] = useState("");
  const [caseType, setCaseType] = useState<"execution" | "collection">("execution");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState(3);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (title.length < 3) return;
    onSubmit({ title, caseType, description, priority });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Título do Caso *
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Execução - João da Silva - Contrato 12345"
          required
          minLength={3}
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="caseType" className="mb-1 block text-sm font-medium text-gray-700">
          Tipo de Ação *
        </label>
        <select
          id="caseType"
          value={caseType}
          onChange={(e) => setCaseType(e.target.value as "execution" | "collection")}
          className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          {TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="priority" className="mb-1 block text-sm font-medium text-gray-700">
          Prioridade (1=Alta, 5=Baixa)
        </label>
        <select
          id="priority"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
          className="h-8 w-full rounded-lg border border-border bg-background px-3 text-sm"
        >
          <option value={1}>1 - Urgente</option>
          <option value={2}>2 - Alta</option>
          <option value={3}>3 - Normal</option>
          <option value={4}>4 - Baixa</option>
          <option value={5}>5 - Muito Baixa</option>
        </select>
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
          Descrição
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Observações sobre o caso..."
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>

      <Button type="submit" disabled={isLoading || title.length < 3} className="w-full">
        {isLoading ? "Criando..." : "Criar Caso"}
      </Button>
    </form>
  );
}
