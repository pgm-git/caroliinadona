/**
 * Generate standardized storage path for a document.
 * Format: {org_id}/{case_id}/{document_id}.{ext}
 */
export function generateStoragePath(
  orgId: string,
  caseId: string,
  documentId: string,
  originalFilename: string
): string {
  const ext = getFileExtension(originalFilename);
  return `${orgId}/${caseId}/${documentId}${ext}`;
}

function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return "";
  return filename.slice(lastDot).toLowerCase();
}
