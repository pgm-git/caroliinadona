/**
 * Google Document AI configuration.
 *
 * Required env vars:
 * - GOOGLE_DOCUMENT_AI_PROCESSOR_ID: Full resource name
 *   (projects/{project}/locations/{location}/processors/{processor})
 * - GOOGLE_APPLICATION_CREDENTIALS: Path to service account JSON (or use ADC)
 */
export function getDocumentAiConfig() {
  const processorName = process.env.GOOGLE_DOCUMENT_AI_PROCESSOR_ID;
  if (!processorName) {
    throw new Error(
      "Missing GOOGLE_DOCUMENT_AI_PROCESSOR_ID environment variable"
    );
  }
  return { processorName };
}
