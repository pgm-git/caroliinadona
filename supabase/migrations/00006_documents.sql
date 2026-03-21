-- Migration: 00006_documents
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Documentos uploadados vinculados a casos
--
-- Depends on: 00004_cases

BEGIN;

-- =============================================================================
-- DOCUMENTS (Documentos uploadados)
-- =============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculo
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Classificacao
    document_type document_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,

    -- Arquivo (Supabase Storage)
    storage_bucket TEXT NOT NULL DEFAULT 'case-documents',
    storage_path TEXT NOT NULL,                   -- Path no bucket: {org_id}/{case_id}/{filename}
    original_filename TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    file_hash VARCHAR(64),                        -- SHA-256 do arquivo (deduplicacao)

    -- Processamento IA
    is_processed BOOLEAN NOT NULL DEFAULT false,
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_error TEXT,
    ocr_text TEXT,                                -- Texto extraido por OCR
    ai_classification document_type,              -- Classificacao automatica pela IA
    ai_confidence DECIMAL(5,4),                   -- Confianca da classificacao (0.0000 a 1.0000)

    -- Versionamento
    version INTEGER NOT NULL DEFAULT 1,
    parent_document_id UUID REFERENCES documents(id), -- Documento original (se for versao)

    -- Metadados
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "pages": 5,
    --   "language": "pt-BR",
    --   "has_signature": true,
    --   "has_stamp": true,
    --   "extraction_results": { ... },
    --   "tags": ["contrato_principal", "assinado"]
    -- }

    -- Responsavel pelo upload
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ              -- Soft delete
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Multi-tenancy
CREATE INDEX idx_documents_org_id ON documents(org_id);

-- Caso (query principal)
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_documents_case_type ON documents(case_id, document_type);

-- Processamento IA
CREATE INDEX idx_documents_unprocessed ON documents(org_id, is_processed)
    WHERE is_processed = false AND deleted_at IS NULL;
CREATE INDEX idx_documents_processing ON documents(processing_started_at)
    WHERE is_processed = false AND processing_started_at IS NOT NULL;

-- Hash (deduplicacao)
CREATE INDEX idx_documents_hash ON documents(file_hash)
    WHERE file_hash IS NOT NULL;

-- Storage path (unicidade)
CREATE UNIQUE INDEX idx_documents_storage_path ON documents(storage_path);

-- Busca por titulo
CREATE INDEX idx_documents_title_trgm ON documents USING gin (title gin_trgm_ops);

-- Full-text search no OCR
CREATE INDEX idx_documents_ocr_fts ON documents
    USING gin (to_tsvector('portuguese', COALESCE(ocr_text, '')))
    WHERE ocr_text IS NOT NULL;

-- Versionamento
CREATE INDEX idx_documents_parent ON documents(parent_document_id)
    WHERE parent_document_id IS NOT NULL;

-- Soft delete
CREATE INDEX idx_documents_not_deleted ON documents(case_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE documents IS 'Documentos uploadados vinculados a casos (CCBs, contratos, garantias)';
COMMENT ON COLUMN documents.storage_path IS 'Path no Supabase Storage: {org_id}/{case_id}/{filename}';
COMMENT ON COLUMN documents.ocr_text IS 'Texto completo extraido por OCR do documento';
COMMENT ON COLUMN documents.ai_classification IS 'Classificacao automatica do tipo de documento pela IA';
COMMENT ON COLUMN documents.ai_confidence IS 'Score de confianca da classificacao IA (0 a 1)';
COMMENT ON COLUMN documents.file_hash IS 'SHA-256 hash do arquivo para deduplicacao';
COMMENT ON COLUMN documents.metadata IS 'Metadados: paginas, idioma, assinatura, resultados de extracao';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'documents'
    )), 'Table documents was not created';

    RAISE NOTICE 'Migration 00006: Documents table created successfully';
END $$;

COMMIT;
