import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db/client";
import { documents } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";
import { generateStoragePath } from "@/lib/upload/generate-storage-path";
import { calculateFileHash } from "@/lib/upload/file-hash";
import { UPLOAD_CONFIG } from "@/lib/upload/constants";
import { randomUUID } from "crypto";

const BUCKET = "case-documents";
const SIGNED_URL_EXPIRY = 3600; // 1 hour

export interface UploadDocumentInput {
  orgId: string;
  caseId: string;
  fileBuffer: Buffer;
  originalFilename: string;
  mimeType: string;
  documentType: string;
  uploadedBy: string;
}

export interface UploadDocumentResult {
  documentId: string;
  storagePath: string;
  fileHash: string;
}

export class StorageService {
  /**
   * Upload a document to Supabase Storage and create a record in the documents table.
   */
  async uploadDocument(
    input: UploadDocumentInput
  ): Promise<UploadDocumentResult> {
    // Server-side validation
    if (input.fileBuffer.length === 0) {
      throw new Error("Arquivo vazio.");
    }
    if (input.fileBuffer.length > UPLOAD_CONFIG.maxFileSize) {
      throw new Error("Arquivo muito grande. Máximo: 25 MB");
    }
    if (
      !UPLOAD_CONFIG.acceptedMimeTypes.includes(input.mimeType)
    ) {
      throw new Error(
        "Formato não aceito. Use: PDF, JPG, PNG ou TIFF"
      );
    }

    const documentId = randomUUID();
    const storagePath = generateStoragePath(
      input.orgId,
      input.caseId,
      documentId,
      input.originalFilename
    );
    const fileHash = calculateFileHash(input.fileBuffer);

    // Upload to Supabase Storage
    const supabase = await createClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, input.fileBuffer, {
        contentType: input.mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erro ao enviar arquivo: ${uploadError.message}`);
    }

    // Insert document record
    await db.insert(documents).values({
      id: documentId,
      orgId: input.orgId,
      caseId: input.caseId,
      documentType: input.documentType as typeof documents.$inferInsert.documentType,
      title: input.originalFilename,
      storageBucket: BUCKET,
      storagePath,
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      fileSizeBytes: input.fileBuffer.length,
      fileHash,
      uploadedBy: input.uploadedBy,
      metadata: {
        channel: "manual",
        uploadTimestamp: new Date().toISOString(),
      },
    });

    return { documentId, storagePath, fileHash };
  }

  /**
   * Get a signed URL for downloading a document.
   */
  async getSignedUrl(
    storagePath: string,
    expiresIn: number = SIGNED_URL_EXPIRY
  ): Promise<string> {
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data?.signedUrl) {
      throw new Error("Erro ao gerar URL de download.");
    }

    return data.signedUrl;
  }

  /**
   * Soft delete a document (mark deleted_at in DB + remove from Storage).
   */
  async deleteDocument(documentId: string, orgId: string): Promise<void> {
    // Get document record
    const [doc] = await db
      .select()
      .from(documents)
      .where(
        and(eq(documents.id, documentId), eq(documents.orgId, orgId))
      )
      .limit(1);

    if (!doc) {
      throw new Error("Documento não encontrado.");
    }

    // Delete from Storage
    const supabase = await createClient();
    const { error: deleteError } = await supabase.storage
      .from(BUCKET)
      .remove([doc.storagePath]);

    if (deleteError) {
      throw new Error(`Erro ao remover arquivo: ${deleteError.message}`);
    }

    // Soft delete in DB
    await db
      .update(documents)
      .set({ deletedAt: new Date() })
      .where(eq(documents.id, documentId));
  }
}

export const storageService = new StorageService();
