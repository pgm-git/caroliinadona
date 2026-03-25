"use client";

/**
 * Página de gerador de petições.
 * Integra seleção de template, preenchimento automático, editor e exportação.
 */

import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { PetitionEditor } from "@/components/petition/petition-editor";
import { Button } from "@/components/ui/button";

interface TemplateOption {
  code: string;
  name: string;
  description: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    code: "EXECUTION_CCB",
    name: "Execução de CCB",
    description: "Execução de Cédula de Crédito Bancária",
  },
  {
    code: "COLLECTION",
    name: "Ação de Cobrança",
    description: "Ação ordinária de cobrança",
  },
  {
    code: "MONITORY",
    name: "Ação Monitória",
    description: "Ação monitória com mandado de pagamento",
  },
];

export default function PetitionPage() {
  const params = useParams<{ id: string }>();
  const caseId = params.id;

  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [petitionContent, setPetitionContent] = useState<string>("");

  const currentQuery = trpc.petition.getCurrent.useQuery({ caseId });
  const historyQuery = trpc.petition.getHistory.useQuery({ caseId });

  const generateMutation = trpc.petition.generate.useMutation({
    onSuccess: (data) => {
      setPetitionContent(data.contentHtml);
      currentQuery.refetch();
      historyQuery.refetch();
      toast.success(`Petição gerada com sucesso! (v${data.version})`);
    },
    onError: (error) => {
      toast.error(`Erro ao gerar petição: ${error.message}`);
    },
  });

  const handleGeneratePetition = async (templateCode: string) => {
    if (!templateCode) {
      toast.error("Selecione um template");
      return;
    }

    generateMutation.mutate({
      caseId,
      templateCode,
    });
  };

  const current = currentQuery.data;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Gerador de Petições</h1>
        <p className="text-gray-600">
          Gere e edite petições com templates predefinidos e formatação jurídica.
        </p>
      </div>

      {/* Template Selection */}
      <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">1. Selecione um Template</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {TEMPLATES.map((template) => (
            <div
              key={template.code}
              onClick={() => setSelectedTemplate(template.code)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedTemplate === template.code
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-bold">{template.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {template.description}
              </p>
            </div>
          ))}
        </div>

        <Button
          onClick={() => handleGeneratePetition(selectedTemplate)}
          disabled={!selectedTemplate || generateMutation.isPending}
          size="lg"
        >
          {generateMutation.isPending ? "Gerando..." : "Gerar Petição"}
        </Button>
      </div>

      {/* Current Petition */}
      {current && (
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{current.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Versão {current.version} • Status: {current.status}
              </p>
            </div>
          </div>

          {/* Editor */}
          <PetitionEditor
            petitionId={current.id}
            initialContent={current.contentHtml || ""}
            onSave={(content) => setPetitionContent(content)}
          />

          {/* Preview Button */}
          <div className="mt-6 flex gap-2">
            <Button variant="outline">Ver Preview</Button>
            <Button variant="outline">Exportar PDF</Button>
            <Button variant="outline">Exportar DOCX</Button>
          </div>
        </div>
      )}

      {/* History */}
      {historyQuery.data && historyQuery.data.length > 0 && (
        <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Histórico de Versões</h2>
          <div className="space-y-2">
            {historyQuery.data.map((petition) => (
              <div key={petition.id} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">v{petition.version}</p>
                    <p className="text-sm text-gray-600">
                      {petition.createdAt?.toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    petition.status === "generated"
                      ? "bg-blue-100 text-blue-800"
                      : petition.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {petition.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
