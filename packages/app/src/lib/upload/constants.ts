export const UPLOAD_CONFIG = {
  maxFileSize: 25 * 1024 * 1024, // 25 MB
  maxFiles: 50,
  acceptedMimeTypes: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/tiff",
  ] as readonly string[],
  acceptedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".tif", ".tiff"],
  acceptString: ".pdf,.jpg,.jpeg,.png,.tif,.tiff",
} as const;

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
