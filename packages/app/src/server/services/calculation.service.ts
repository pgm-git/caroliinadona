/**
 * Calculation orchestration service.
 * Combines correction + interest + fees into a full debt calculation,
 * persists to DB with versioning.
 */

import { db } from "@/server/db/client";
import { calculations, cases } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import {
  calculateCorrection,
  type CorrectionResult,
} from "@/lib/calculation/correction";
import {
  calculateInterest,
  monthsBetween,
  type InterestResult,
  type InterestType,
} from "@/lib/calculation/interest";
import {
  calculateFees,
  type FeesResult,
  type LegalWarning,
} from "@/lib/calculation/fees";

export interface CalculationParams {
  caseId: string;
  orgId: string;
  userId: string;
  principalAmount: number;
  contractDate: string; // YYYY-MM-DD
  defaultDate: string; // YYYY-MM-DD
  calculationDate: string; // YYYY-MM-DD
  correctionIndex: string;
  interestRateMonthly: number; // e.g. 1.0 = 1%
  interestType: InterestType;
  penaltyRate: number; // e.g. 2.0 = 2%
  attorneyFeesRate: number; // e.g. 10.0 = 10%
  courtCosts?: number;
  otherCharges?: number;
}

export interface FullCalculationResult {
  correction: CorrectionResult;
  interest: InterestResult;
  fees: FeesResult;
  summary: {
    principalAmount: number;
    correctedAmount: number;
    correctionDifference: number;
    interestAmount: number;
    penaltyAmount: number;
    attorneyFeesAmount: number;
    courtCosts: number;
    otherCharges: number;
    totalAmount: number;
  };
  warnings: LegalWarning[];
  calculationId: string;
  version: number;
}

class CalculationService {
  /**
   * Execute full calculation for a case and persist to DB.
   */
  async calculateCase(
    params: CalculationParams
  ): Promise<FullCalculationResult> {
    // 1. Monetary correction
    const correction = await calculateCorrection({
      principalAmount: params.principalAmount,
      indexCode: params.correctionIndex,
      startDate: params.defaultDate,
      endDate: params.calculationDate,
    });

    // 2. Interest on corrected amount
    const months = monthsBetween(params.defaultDate, params.calculationDate);
    const interest = calculateInterest({
      baseAmount: correction.correctedAmount,
      monthlyRate: params.interestRateMonthly,
      months,
      type: params.interestType,
    });

    // 3. Fees and penalties on (corrected + interest)
    const debtTotal = interest.totalWithInterest;
    const fees = calculateFees({
      debtTotal,
      penaltyRate: params.penaltyRate,
      attorneyFeesRate: params.attorneyFeesRate,
      courtCosts: params.courtCosts,
      otherCharges: params.otherCharges,
    });

    // 4. Persist: deactivate previous current calculation
    await db
      .update(calculations)
      .set({ isCurrent: false })
      .where(
        and(
          eq(calculations.caseId, params.caseId),
          eq(calculations.isCurrent, true)
        )
      );

    // 5. Get next version number
    const existing = await db
      .select({ version: calculations.version })
      .from(calculations)
      .where(eq(calculations.caseId, params.caseId))
      .orderBy(calculations.version)
      .limit(1);

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    // 6. Insert new calculation
    const [inserted] = await db
      .insert(calculations)
      .values({
        orgId: params.orgId,
        caseId: params.caseId,
        principalAmount: String(params.principalAmount),
        contractDate: params.contractDate,
        defaultDate: params.defaultDate,
        calculationDate: params.calculationDate,
        correctionIndex: params.correctionIndex as "igpm" | "ipca" | "inpc" | "selic" | "cdi" | "tr" | "tjlp" | "custom",
        interestRateMonthly: String(params.interestRateMonthly),
        penaltyRate: String(params.penaltyRate),
        attorneyFeesRate: String(params.attorneyFeesRate),
        correctedAmount: String(correction.correctedAmount),
        interestAmount: String(interest.interestAmount),
        penaltyAmount: String(fees.penaltyAmount),
        attorneyFeesAmount: String(fees.attorneyFeesAmount),
        courtCosts: String(fees.courtCosts),
        otherCharges: String(fees.otherCharges),
        totalAmount: String(fees.grandTotal),
        monthlyBreakdown: correction.monthlyBreakdown,
        indexValues: correction.indexValues,
        isCurrent: true,
        version: nextVersion,
        calculatedBy: params.userId,
        calculationMethod: "automated",
      })
      .returning({ id: calculations.id });

    // 7. Update case financial fields
    await db
      .update(cases)
      .set({
        principalAmount: String(params.principalAmount),
        correctionAmount: String(correction.totalCorrectionAmount),
        interestAmount: String(interest.interestAmount),
        feesAmount: String(fees.attorneyFeesAmount),
        totalAmount: String(fees.grandTotal),
        correctionIndex: params.correctionIndex as "igpm" | "ipca" | "inpc" | "selic" | "cdi" | "tr" | "tjlp" | "custom",
        interestRate: String(params.interestRateMonthly),
        penaltyRate: String(params.penaltyRate),
        calculationBaseDate: params.calculationDate,
        calculationCompletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(cases.id, params.caseId));

    return {
      correction,
      interest,
      fees,
      summary: {
        principalAmount: params.principalAmount,
        correctedAmount: correction.correctedAmount,
        correctionDifference: correction.totalCorrectionAmount,
        interestAmount: interest.interestAmount,
        penaltyAmount: fees.penaltyAmount,
        attorneyFeesAmount: fees.attorneyFeesAmount,
        courtCosts: fees.courtCosts,
        otherCharges: fees.otherCharges,
        totalAmount: fees.grandTotal,
      },
      warnings: fees.warnings,
      calculationId: inserted.id,
      version: nextVersion,
    };
  }

  /**
   * Get the current (latest) calculation for a case.
   */
  async getCurrentCalculation(caseId: string, orgId: string) {
    const [calc] = await db
      .select()
      .from(calculations)
      .where(
        and(
          eq(calculations.caseId, caseId),
          eq(calculations.orgId, orgId),
          eq(calculations.isCurrent, true)
        )
      )
      .limit(1);

    return calc ?? null;
  }

  /**
   * Get all calculation versions for a case.
   */
  async getCalculationHistory(caseId: string, orgId: string) {
    return db
      .select()
      .from(calculations)
      .where(
        and(
          eq(calculations.caseId, caseId),
          eq(calculations.orgId, orgId)
        )
      )
      .orderBy(calculations.version);
  }

  /**
   * Validate a calculation (mark as reviewed/approved).
   */
  async validateCalculation(
    calculationId: string,
    orgId: string,
    userId: string,
    notes?: string
  ) {
    await db
      .update(calculations)
      .set({
        isValidated: true,
        validatedBy: userId,
        validatedAt: new Date(),
        validationNotes: notes ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(calculations.id, calculationId),
          eq(calculations.orgId, orgId)
        )
      );
  }
}

export const calculationService = new CalculationService();
