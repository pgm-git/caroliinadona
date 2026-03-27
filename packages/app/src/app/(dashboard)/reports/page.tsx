"use client";

import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-sm text-gray-500">
          Métricas avançadas e relatórios gerenciais da operação.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="rounded-full bg-green-50 p-3 mb-4">
          <BarChart3 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Relatórios Gerenciais</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          O módulo de BI e relatórios avançados estará disponível após a consolidação da base de dados.
          Utilize o dashboard principal (Dashboard) para visualizar as métricas atuais.
        </p>
      </Card>
    </div>
  );
}
