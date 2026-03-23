import { createHash } from "crypto";

/**
 * Calculate SHA-256 hash of a buffer.
 */
export function calculateFileHash(data: Buffer | Uint8Array): string {
  return createHash("sha256").update(data).digest("hex");
}
