/**
 * Algorithmic CPF and CNPJ validation (Brazilian tax IDs).
 */

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Validate a CPF number using check digits.
 */
export function isValidCpf(cpf: string): boolean {
  const digits = stripNonDigits(cpf);
  if (digits.length !== 11) return false;

  // Reject known invalid patterns (all same digit)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[9])) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += Number(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== Number(digits[10])) return false;

  return true;
}

/**
 * Validate a CNPJ number using check digits.
 */
export function isValidCnpj(cnpj: string): boolean {
  const digits = stripNonDigits(cnpj);
  if (digits.length !== 14) return false;

  // Reject known invalid patterns
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  // First check digit
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += Number(digits[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const check1 = remainder < 2 ? 0 : 11 - remainder;
  if (check1 !== Number(digits[12])) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += Number(digits[i]) * weights2[i];
  }
  remainder = sum % 11;
  const check2 = remainder < 2 ? 0 : 11 - remainder;
  if (check2 !== Number(digits[13])) return false;

  return true;
}

/**
 * Validate CPF or CNPJ based on length.
 */
export function isValidCpfCnpj(value: string): boolean {
  const digits = stripNonDigits(value);
  if (digits.length === 11) return isValidCpf(digits);
  if (digits.length === 14) return isValidCnpj(digits);
  return false;
}
