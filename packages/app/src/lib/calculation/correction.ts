/**
 * Monetary correction engine.
 * Applies month-by-month correction using BCB indices.
 */

import { getMonthlyIndexMap } from "./bcb-client";

export interface CorrectionInput {
  principalAmount: number;
  indexCode: string; // igpm, ipca, inpc, selic, cdi, tr
  startDate: string; // YYYY-MM-DD (default/vencimento date)
  endDate: string; // YYYY-MM-DD (calculation date)
}

export interface MonthlyEntry {
  month: string; // YYYY-MM
  indexRate: number; // % applied that month
  cumulativeFactor: number; // accumulated correction factor
  correctedBalance: number; // corrected balance at end of month
  correctionInMonth: number; // amount of correction added that month
}

export interface CorrectionResult {
  originalAmount: number;
  correctedAmount: number;
  totalCorrectionAmount: number;
  cumulativeFactor: number;
  monthlyBreakdown: MonthlyEntry[];
  indexValues: Record<string, number>; // YYYY-MM → rate
}

/**
 * Calculate monetary correction month-by-month.
 */
export async function calculateCorrection(
  input: CorrectionInput
): Promise<CorrectionResult> {
  const { principalAmount, indexCode, startDate, endDate } = input;

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start >= end) {
    return {
      originalAmount: principalAmount,
      correctedAmount: principalAmount,
      totalCorrectionAmount: 0,
      cumulativeFactor: 1,
      monthlyBreakdown: [],
      indexValues: {},
    };
  }

  // Fetch index values from BCB
  const indexMap = await getMonthlyIndexMap(indexCode, start, end);

  const monthlyBreakdown: MonthlyEntry[] = [];
  const indexValues: Record<string, number> = {};

  let cumulativeFactor = 1;
  let currentBalance = principalAmount;

  // Iterate month by month
  const cursor = new Date(start.getFullYear(), start.getMonth() + 1, 1);

  while (cursor <= end) {
    const ym = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const rate = indexMap.get(ym) ?? 0;
    indexValues[ym] = rate;

    const factor = 1 + rate / 100;
    cumulativeFactor *= factor;

    const prevBalance = currentBalance;
    currentBalance = currentBalance * factor;
    const correctionInMonth = currentBalance - prevBalance;

    monthlyBreakdown.push({
      month: ym,
      indexRate: rate,
      cumulativeFactor,
      correctedBalance: Math.round(currentBalance * 100) / 100,
      correctionInMonth: Math.round(correctionInMonth * 100) / 100,
    });

    // Next month
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return {
    originalAmount: principalAmount,
    correctedAmount: Math.round(currentBalance * 100) / 100,
    totalCorrectionAmount:
      Math.round((currentBalance - principalAmount) * 100) / 100,
    cumulativeFactor: Math.round(cumulativeFactor * 1000000) / 1000000,
    monthlyBreakdown,
    indexValues,
  };
}
