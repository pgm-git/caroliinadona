"use client";

import { Scale } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function PetitionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Petições</h1>
        <p className="text-sm text-gray-500">
          Visão global de todas as petições geradas pelo sistema.
        </p>
      </div>

      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2">
        <div className="rounded-full bg-purple-50 p-3 mb-4">
          <Scale className="h-8 w-8 text-purple-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Editor Global de Petições</h2>
        <p className="text-sm text-gray-500 max-w-sm">
          A lista global de petições está em desenvolvimento. 
          Acesse a geração e o editor de petições diretamente pela página de detalhe de cada caso.
        </p>
      </Card>
    </div>
  );
}
