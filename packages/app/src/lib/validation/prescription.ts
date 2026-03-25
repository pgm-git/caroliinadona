/**
 * Prescription (statute of limitations) calculation for Brazilian debt titles.
 * Based on Art. 206, Código Civil.
 */

/** Prescription periods in years by document type. */
const PRESCRIPTION_YEARS: Record<string, number> = {
  credit_certificate: 5,  // CCB — Art. 206 §5º I
  contract: 5,            // Contrato — Art. 206 §5º I
  promissory_note: 3,     // Nota Promissória — ação cambial (Art. 206 §3º VIII)
  check: 6 / 12,          // Cheque — 6 meses (Art. 59 Lei 7.357)
  duplicate: 3,           // Duplicata — Art. 18 Lei 5.474
  guarantee: 5,
  debenture: 5,
  other: 5,
};

export interface PrescriptionResult {
  prescriptionDate: Date;
  daysRemaining: number;
  years: number;
  isPrescribed: boolean;
  isNearPrescription: boolean; // < 90 days
}

/**
 * Calculate prescription date and remaining days.
 */
export function calculatePrescription(
  documentType: string,
  dueDate: string | Date
): PrescriptionResult {
  const years = PRESCRIPTION_YEARS[documentType] ?? 5;
  const due = new Date(dueDate);
  const prescriptionDate = new Date(due);
  prescriptionDate.setFullYear(prescriptionDate.getFullYear() + Math.floor(years));

  // Handle fractional years (e.g., check = 0.5 years = 6 months)
  const fractionalMonths = (years % 1) * 12;
  if (fractionalMonths > 0) {
    prescriptionDate.setMonth(prescriptionDate.getMonth() + Math.round(fractionalMonths));
  }

  const now = new Date();
  const diffMs = prescriptionDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    prescriptionDate,
    daysRemaining,
    years,
    isPrescribed: daysRemaining <= 0,
    isNearPrescription: daysRemaining > 0 && daysRemaining <= 90,
  };
}
