import { DocumentProcessorServiceClient } from "@google-cloud/documentai";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/server/db/client";
import { documents } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getDocumentAiConfig } from "@/server/config/google-ai";

export interface OcrResult {
  text: string;
  confidence: number;
  pages: Array<{
    pageNumber: number;
    confidence: number;
  }>;
}

export class OcrService {
  private client: DocumentProcessorServiceClient;

  constructor() {
    this.client = new DocumentProcessorServiceClient();
  }

  /**
   * Process a raw document buffer through Google Document AI OCR.
   */
  async processDocument(
    content: Buffer,
    mimeType: string
  ): Promise<OcrResult> {
    const { processorName } = getDocumentAiConfig();

    const [result] = await this.client.processDocument({
      name: processorName,
      rawDocument: {
        content: content.toString("base64"),
        mimeType,
      },
    });

    const doc = result.document;
    if (!doc?.text) {
      throw new Error("OCR não retornou texto. O documento pode estar vazio ou corrompido.");
    }

    const pages = (doc.pages ?? []).map((p, idx) => {
      // Confidence may be on the page or in layout/blocks
      const pageConfidence =
        (p as unknown as Record<string, number>).confidence ?? 0;
      return {
        pageNumber: p.pageNumber ?? idx + 1,
        confidence: pageConfidence,
      };
    });

    const avgConfidence =
      pages.length > 0
        ? pages.reduce((sum, p) => sum + p.confidence, 0) / pages.length
        : 0;

    return {
      text: doc.text,
      confidence: avgConfidence,
      pages,
    };
  }

  /**
   * Full OCR pipeline: download from storage → OCR → persist results.
   */
  async processOcr(
    documentId: string,
    orgId: string
  ): Promise<OcrResult> {
    // 1. Get document record
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId))
      .limit(1);

    if (!doc || doc.orgId !== orgId) {
      throw new Error("Documento não encontrado.");
    }

    // 2. Download from Supabase Storage
    const supabase = await createClient();
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(doc.storageBucket)
      .download(doc.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Erro ao baixar documento: ${downloadError?.message ?? "arquivo não encontrado"}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // 3. Run OCR
    console.log(`[ocr] Processing document ${documentId} (${doc.mimeType})`);
    const ocrResult = await this.processDocument(buffer, doc.mimeType);
    console.log(
      `[ocr] Document ${documentId}: ${ocrResult.pages.length} pages, confidence ${(ocrResult.confidence * 100).toFixed(1)}%`
    );

    // 4. Persist OCR results
    await db
      .update(documents)
      .set({
        ocrText: ocrResult.text,
        aiConfidence: ocrResult.confidence.toFixed(4),
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return ocrResult;
  }
}

export const ocrService = new OcrService();
