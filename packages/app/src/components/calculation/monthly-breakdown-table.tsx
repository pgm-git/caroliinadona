"use client";

import { BarChart3 } from "lucide-react";

interface MonthlyEntry {
  month: string;
  indexRate: number;
  cumulativeFactor: number;
  correctedBalance: number;
  correctionInMonth: number;
}

interface MonthlyBreakdownTableProps {
  entries: MonthlyEntry[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatMonth(ym: string): string {
  const [year, month] = ym.split("-");
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  return `${months[parseInt(month) - 1]}/${year}`;
}

export function MonthlyBreakdownTable({
  entries,
}: MonthlyBreakdownTableProps) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Nenhum dado de breakdown dispon&iacute;vel.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 border-b pb-2">
        <BarChart3 className="size-4 text-gray-500" />
        <h4 className="text-sm font-semibold">Mem&oacute;ria de C&aacute;lculo Mensal</h4>
      </div>

      <div className="max-h-[400px] overflow-auto rounded-lg border">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left font-medium text-gray-600">
                M&ecirc;s
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                &Iacute;ndice (%)
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Fator Acum.
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Corre&ccedil;&atilde;o no M&ecirc;s
              </th>
              <th className="px-3 py-2 text-right font-medium text-gray-600">
                Saldo Corrigido
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr
                key={entry.month}
                className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
              >
                <td className="px-3 py-1.5 font-medium">
                  {formatMonth(entry.month)}
                </td>
                <td className="px-3 py-1.5 text-right">
                  {entry.indexRate.toFixed(4)}%
                </td>
                <td className="px-3 py-1.5 text-right">
                  {entry.cumulativeFactor.toFixed(6)}
                </td>
                <td className="px-3 py-1.5 text-right text-green-700">
                  {formatCurrency(entry.correctionInMonth)}
                </td>
                <td className="px-3 py-1.5 text-right font-medium">
                  {formatCurrency(entry.correctedBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
