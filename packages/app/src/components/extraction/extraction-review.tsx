"use client";

import { DocumentViewer } from "@/components/documents/document-viewer";
import { ExtractedFieldCard } from "./extracted-field-card";
import { PartyCard } from "./party-card";
import { ConfidenceBadge } from "./confidence-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, RotateCcw, FileText } from "lucide-react";

interface ExtractionData {
  id: string;
  confidenceScore: string;
  extractedFields: Record<string, unknown>;
  extractionModel: string;
  isApproved: boolean | null;
  createdAt: Date | string;
}

interface DocumentData {
  id: string;
  title: string;
  mimeType: string;
  documentType: string;
  aiClassification: string | null;
  aiConfidence: string | null;
}

interface PartyData {
  id: string;
  role: string;
  personType: string;
  fullName: string;
  cpf: string | null;
  cnpj: string | null;
  isPrimary: boolean;
  addressStreet: string | null;
}

interface ExtractionReviewProps {
  extraction: ExtractionData;
  document: DocumentData;
  documentUrl: string;
  parties: PartyData[];
  onApprove: () => void;
  onReprocess: () => void;
  onSaveField: (fieldPath: string, newValue: string) => void;
  isApproving?: boolean;
  isReprocessing?: boolean;
  isSaving?: boolean;
}

export function ExtractionReview({
  extraction,
  document: doc,
  documentUrl,
  parties,
  onApprove,
  onReprocess,
  onSaveField,
  isApproving,
  isReprocessing,
  isSaving,
}: ExtractionReviewProps) {
  const overallConfidence = Number(extraction.confidenceScore) * 100;
  const fields = extraction.extractedFields as Record<string, unknown>;

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4">
      {/* Left: Document Viewer */}
      <div className="flex-1 min-w-0">
        <DocumentViewer
          url={documentUrl}
          mimeType={doc.mimeType}
          title={doc.title}
          className="h-full"
        />
      </div>

      {/* Right: Extraction Data */}
      <div className="w-[440px] shrink-0 overflow-y-auto rounded-lg border bg-white p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-gray-500" />
            <h2 className="text-lg font-bold">Dados Extraídos</h2>
          </div>
          <ConfidenceBadge score={overallConfidence} />
        </div>

        {/* Classification */}
        {doc.aiClassification && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs text-gray-500">Classificação:</span>
            <Badge variant="secondary">{doc.aiClassification}</Badge>
            {doc.aiConfidence && (
              <ConfidenceBadge score={Number(doc.aiConfidence) * 100} />
            )}
          </div>
        )}

        {/* Status */}
        {extraction.isApproved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 p-2 text-sm text-green-700">
            <CheckCircle className="size-4" />
            Extração aprovada
          </div>
        )}

        {/* Model info */}
        <p className="mb-4 text-[11px] text-gray-400">
          Modelo: {extraction.extractionModel} | Extraído em:{" "}
          {new Date(extraction.createdAt).toLocaleString("pt-BR")}
        </p>

        {/* Extracted Fields */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Campos</h3>
          <ExtractedFieldCard
            fields={fields}
            onSaveField={onSaveField}
            isSaving={isSaving}
          />
        </div>

        {/* Parties */}
        {parties.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">
              Partes Identificadas
            </h3>
            <div className="space-y-2">
              {parties.map((party) => (
                <PartyCard
                  key={party.id}
                  role={party.role}
                  personType={party.personType}
                  fullName={party.fullName}
                  cpf={party.cpf}
                  cnpj={party.cnpj}
                  isPrimary={party.isPrimary}
                  addressStreet={party.addressStreet}
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 border-t pt-4">
          <Button
            onClick={onApprove}
            disabled={isApproving || extraction.isApproved === true}
            className="flex-1"
          >
            <CheckCircle className="mr-1 size-4" />
            Aprovar Extração
          </Button>
          <Button
            variant="outline"
            onClick={onReprocess}
            disabled={isReprocessing}
          >
            <RotateCcw className="mr-1 size-4" />
            Reprocessar
          </Button>
        </div>
      </div>
    </div>
  );
}
