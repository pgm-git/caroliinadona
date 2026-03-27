"use client";

import { FileCode } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Templates</h1>
        <p className="text-sm text-gray-500">
          Gerenciamento de modelos pré-definidos para petições e relatórios.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="rounded-full bg-orange-50 p-3 mb-4">
          <FileCode className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Editor de Templates</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          A personalização de modelos de peças jurídicas será habilitada em futuras atualizações. No momento, o sistema utiliza templates padrão controlados pela plataforma.
        </p>
      </Card>
    </div>
  );
}
