import OpenAI from "openai";
import { createHash } from "crypto";
import { db } from "@/server/db/client";
import { documents, extractedData } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import {
  SYSTEM_PROMPT_CLASSIFY,
  getExtractionPrompt,
} from "@/server/config/extraction-prompts";

const EXTRACTION_VERSION = "1.0.0";
const MODEL = "gpt-4o";

function getOpenAiClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable");
  }
  return new OpenAI({ apiKey });
}

export interface ClassificationResult {
  type: string;
  confidence: number;
  reasoning: string;
}

export class ExtractionService {
  /**
   * Classify document type from OCR text.
   */
  async classifyDocumentType(ocrText: string): Promise<ClassificationResult> {
    const openai = getOpenAiClient();

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT_CLASSIFY },
        { role: "user", content: ocrText.slice(0, 8000) },
      ],
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("GPT-4o não retornou classificação.");
    }

    const parsed = JSON.parse(content) as ClassificationResult;
    console.log(
      `[extraction] Classification: ${parsed.type} (${parsed.confidence}%) — ${parsed.reasoning}`
    );

    return parsed;
  }

  /**
   * Extract structured data from OCR text using GPT-4o.
   */
  async extractStructuredData(
    ocrText: string,
    documentType: string
  ): Promise<{ fields: Record<string, unknown>; rawResponse: string }> {
    const openai = getOpenAiClient();
    const prompt = getExtractionPrompt(documentType);

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: prompt },
      {
        role: "user",
        content: `Extraia os dados do seguinte texto OCR:\n\n${ocrText}`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      response_format: { type: "json_object" },
      temperature: 0,
    });

    const rawResponse = response.choices[0]?.message?.content ?? "";
    if (!rawResponse) {
      throw new Error("GPT-4o não retornou dados de extração.");
    }

    const fields = JSON.parse(rawResponse) as Record<string, unknown>;
    return { fields, rawResponse };
  }

  /**
   * Calculate average confidence from extracted fields.
   */
  calculateAverageConfidence(
    fields: Record<string, unknown>
  ): number {
    const confidences: number[] = [];

    function collect(obj: unknown) {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const record = obj as Record<string, unknown>;
        if ("confidence" in record && typeof record.confidence === "number") {
          confidences.push(record.confidence);
        }
        for (const value of Object.values(record)) {
          collect(value);
        }
      }
    }

    collect(fields);

    if (confidences.length === 0) return 0;
    return (
      confidences.reduce((sum, c) => sum + c, 0) / confidences.length / 100
    );
  }

  /**
   * Full extraction pipeline: extract + persist.
   */
  async extractAndPersist(
    documentId: string,
    caseId: string,
    orgId: string,
    ocrText: string,
    documentType: string
  ): Promise<string> {
    const prompt = getExtractionPrompt(documentType);
    const promptHash = createHash("sha256")
      .update(prompt)
      .digest("hex")
      .slice(0, 64);

    console.log(
      `[extraction] Extracting fields for document ${documentId} (type: ${documentType})`
    );

    const { fields, rawResponse } = await this.extractStructuredData(
      ocrText,
      documentType
    );

    const avgConfidence = this.calculateAverageConfidence(fields);
    console.log(
      `[extraction] Document ${documentId}: avg confidence ${(avgConfidence * 100).toFixed(1)}%`
    );

    // Persist extraction result
    const [inserted] = await db
      .insert(extractedData)
      .values({
        orgId,
        caseId,
        documentId,
        extractionModel: MODEL,
        extractionVersion: EXTRACTION_VERSION,
        extractionPromptHash: promptHash,
        confidenceScore: avgConfidence.toFixed(4),
        extractedFields: fields,
        rawExtraction: rawResponse,
      })
      .returning({ id: extractedData.id });

    // Update document classification
    await db
      .update(documents)
      .set({
        aiClassification:
          documentType as typeof documents.$inferInsert.aiClassification,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, documentId));

    return inserted.id;
  }
}

export const extractionService = new ExtractionService();
