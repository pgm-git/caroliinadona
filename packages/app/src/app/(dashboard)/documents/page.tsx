"use client";

import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DocumentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
        <p className="text-sm text-gray-500">
          Centralização e repositório geral de documentos do sistema.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="rounded-full bg-blue-50 p-3 mb-4">
          <FileText className="h-8 w-8 text-blue-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Central de Documentos</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          A visualização unificada de documentos está em desenvolvimento para uma próxima versão. 
          Enquanto isso, acesse os documentos diretamente pela fila de entrada ou vinculados dentro da página de detalhe de cada caso.
        </p>
      </Card>
    </div>
  );
}
