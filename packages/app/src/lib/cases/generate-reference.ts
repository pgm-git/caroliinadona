/**
 * Generate internal reference for a case.
 * Format: CASO-YYYYMMDD-NNN
 */
export function generateInternalReference(
  sequenceNumber: number,
  date: Date = new Date()
): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = String(sequenceNumber).padStart(3, "0");
  return `CASO-${yyyy}${mm}${dd}-${seq}`;
}
