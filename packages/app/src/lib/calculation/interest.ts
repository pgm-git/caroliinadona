/**
 * Interest calculation engine.
 * Supports simple, compound, and moratory interest.
 */

export type InterestType = "simple" | "compound";

export interface InterestInput {
  /** Base amount (corrected principal) to apply interest on */
  baseAmount: number;
  /** Monthly interest rate as decimal (e.g. 1.0 = 1% per month) */
  monthlyRate: number;
  /** Number of months to calculate interest for */
  months: number;
  /** Type of interest calculation */
  type: InterestType;
}

export interface InterestResult {
  baseAmount: number;
  interestAmount: number;
  totalWithInterest: number;
  effectiveRate: number; // total % of interest over base
  monthlyRate: number;
  months: number;
  type: InterestType;
}

/**
 * Calculate interest (simple or compound).
 *
 * Simple: I = P * r * n
 * Compound: I = P * ((1 + r)^n - 1)
 */
export function calculateInterest(input: InterestInput): InterestResult {
  const { baseAmount, monthlyRate, months, type } = input;

  if (months <= 0 || monthlyRate <= 0) {
    return {
      baseAmount,
      interestAmount: 0,
      totalWithInterest: baseAmount,
      effectiveRate: 0,
      monthlyRate,
      months,
      type,
    };
  }

  const r = monthlyRate / 100; // convert percentage to decimal
  let interestAmount: number;

  if (type === "simple") {
    interestAmount = baseAmount * r * months;
  } else {
    // compound
    interestAmount = baseAmount * (Math.pow(1 + r, months) - 1);
  }

  interestAmount = Math.round(interestAmount * 100) / 100;
  const effectiveRate =
    baseAmount > 0
      ? Math.round((interestAmount / baseAmount) * 10000) / 100
      : 0;

  return {
    baseAmount,
    interestAmount,
    totalWithInterest: Math.round((baseAmount + interestAmount) * 100) / 100,
    effectiveRate,
    monthlyRate,
    months,
    type,
  };
}

/**
 * Calculate months between two dates.
 */
export function monthsBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const yearDiff = end.getFullYear() - start.getFullYear();
  const monthDiff = end.getMonth() - start.getMonth();

  return Math.max(0, yearDiff * 12 + monthDiff);
}
