/**
 * Attorney fees, penalties, and legal limits validation.
 */

export interface FeesInput {
  /** Total debt (corrected + interest) */
  debtTotal: number;
  /** Penalty rate as percentage (e.g. 2.0 = 2%) */
  penaltyRate: number;
  /** Attorney fees rate as percentage (e.g. 10.0 = 10%) */
  attorneyFeesRate: number;
  /** Court costs (fixed value) */
  courtCosts?: number;
  /** Other charges (fixed value) */
  otherCharges?: number;
}

export interface LegalWarning {
  code: string;
  message: string;
  field: string;
  limit: number;
  actual: number;
}

export interface FeesResult {
  penaltyAmount: number;
  attorneyFeesAmount: number;
  courtCosts: number;
  otherCharges: number;
  subtotal: number; // penalty + fees + costs + charges
  grandTotal: number; // debtTotal + subtotal
  warnings: LegalWarning[];
}

// Legal limits
const MAX_PENALTY_RATE = 2.0; // Art. 52 §1 CDC / Art. 412 CC
const MAX_ATTORNEY_FEES_RATE = 20.0; // Common judicial practice
const MIN_ATTORNEY_FEES_RATE = 10.0; // Art. 85 §2 CPC minimum

/**
 * Calculate fees, penalties, and validate legal limits.
 */
export function calculateFees(input: FeesInput): FeesResult {
  const {
    debtTotal,
    penaltyRate,
    attorneyFeesRate,
    courtCosts = 0,
    otherCharges = 0,
  } = input;

  const warnings: LegalWarning[] = [];

  // Penalty calculation with limit check
  let effectivePenaltyRate = penaltyRate;
  if (penaltyRate > MAX_PENALTY_RATE) {
    warnings.push({
      code: "PENALTY_EXCEEDS_LIMIT",
      message: `Multa de ${penaltyRate}% excede o limite legal de ${MAX_PENALTY_RATE}%. Aplicado limite.`,
      field: "penaltyRate",
      limit: MAX_PENALTY_RATE,
      actual: penaltyRate,
    });
    effectivePenaltyRate = MAX_PENALTY_RATE;
  }

  const penaltyAmount =
    Math.round(debtTotal * (effectivePenaltyRate / 100) * 100) / 100;

  // Attorney fees with limit check
  let effectiveFeesRate = attorneyFeesRate;
  if (attorneyFeesRate > MAX_ATTORNEY_FEES_RATE) {
    warnings.push({
      code: "ATTORNEY_FEES_EXCEEDS_LIMIT",
      message: `Honorários de ${attorneyFeesRate}% excedem a prática judicial máxima de ${MAX_ATTORNEY_FEES_RATE}%.`,
      field: "attorneyFeesRate",
      limit: MAX_ATTORNEY_FEES_RATE,
      actual: attorneyFeesRate,
    });
    effectiveFeesRate = MAX_ATTORNEY_FEES_RATE;
  }

  if (
    attorneyFeesRate > 0 &&
    attorneyFeesRate < MIN_ATTORNEY_FEES_RATE
  ) {
    warnings.push({
      code: "ATTORNEY_FEES_BELOW_MINIMUM",
      message: `Honorários de ${attorneyFeesRate}% estão abaixo do mínimo legal de ${MIN_ATTORNEY_FEES_RATE}% (Art. 85 §2 CPC).`,
      field: "attorneyFeesRate",
      limit: MIN_ATTORNEY_FEES_RATE,
      actual: attorneyFeesRate,
    });
  }

  const attorneyFeesAmount =
    Math.round(debtTotal * (effectiveFeesRate / 100) * 100) / 100;

  const subtotal =
    Math.round(
      (penaltyAmount + attorneyFeesAmount + courtCosts + otherCharges) * 100
    ) / 100;
  const grandTotal = Math.round((debtTotal + subtotal) * 100) / 100;

  return {
    penaltyAmount,
    attorneyFeesAmount,
    courtCosts: Math.round(courtCosts * 100) / 100,
    otherCharges: Math.round(otherCharges * 100) / 100,
    subtotal,
    grandTotal,
    warnings,
  };
}
