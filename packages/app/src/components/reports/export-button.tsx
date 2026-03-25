"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet } from "lucide-react";
import { toast } from "sonner";

interface ExportButtonProps {
  caseId?: string;
  status?: string;
  caseType?: string;
}

export function ExportButton({
  caseId,
  status,
  caseType,
}: ExportButtonProps) {
  const exportCSVMutation = trpc.reports.exportCasesCSV.useMutation({
    onSuccess: (data) => {
      // Create blob and download
      const blob = new Blob([data.content], { type: data.mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Arquivo exportado com sucesso");
    },
    onError: (error) => {
      toast.error(`Erro ao exportar: ${error.message}`);
    },
  });

  const caseSummaryQuery = trpc.reports.getCaseSummaryHTML.useQuery(
    { caseId: caseId || "" },
    { enabled: !!caseId }
  );

  const handleExportCSV = () => {
    exportCSVMutation.mutate({
      status,
      caseType,
    });
  };

  const handleExportPDF = async () => {
    if (!caseId) {
      toast.error("ID do caso é obrigatório para exportar PDF");
      return;
    }

    if (!caseSummaryQuery.data) {
      toast.error("Carregando informações do caso...");
      return;
    }

    // Since we don't have puppeteer installed, we'll show a message
    // In production, this would call a server endpoint to generate PDF
    const htmlContent = caseSummaryQuery.data.html;

    // For now, we'll create a simple HTML download
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "caso-summary.html";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.info(
      "HTML exportado. Para converter em PDF, use o navegador (Ctrl+P ou Cmd+P)"
    );
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        onClick={handleExportCSV}
        disabled={exportCSVMutation.isPending}
        title="Exportar casos como CSV"
      >
        <Sheet className="w-4 h-4 mr-1" />
        {exportCSVMutation.isPending ? "Exportando..." : "CSV"}
      </Button>

      {caseId && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleExportPDF}
          disabled={caseSummaryQuery.isLoading}
          title="Exportar resumo do caso como PDF"
        >
          <FileText className="w-4 h-4 mr-1" />
          {caseSummaryQuery.isLoading ? "Carregando..." : "PDF"}
        </Button>
      )}
    </div>
  );
}
