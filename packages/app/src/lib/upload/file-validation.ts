import { UPLOAD_CONFIG } from "./constants";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: File): FileValidationResult {
  if (file.size === 0) {
    return { valid: false, error: "Arquivo vazio." };
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: "Arquivo muito grande. Máximo: 25 MB" };
  }

  if (!UPLOAD_CONFIG.acceptedMimeTypes.includes(file.type)) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    // Fallback: check extension if MIME type is empty (some browsers)
    if (
      ext &&
      (UPLOAD_CONFIG.acceptedExtensions as readonly string[]).includes(`.${ext}`)
    ) {
      return { valid: true };
    }
    return {
      valid: false,
      error: "Formato não aceito. Use: PDF, JPG, PNG ou TIFF",
    };
  }

  return { valid: true };
}

export function validateFileCount(
  currentCount: number,
  newCount: number
): FileValidationResult {
  if (currentCount + newCount > UPLOAD_CONFIG.maxFiles) {
    return {
      valid: false,
      error: `Máximo de ${UPLOAD_CONFIG.maxFiles} arquivos por vez`,
    };
  }
  return { valid: true };
}
