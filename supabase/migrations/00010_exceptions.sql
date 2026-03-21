-- Migration: 00010_exceptions
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Excecoes e problemas encontrados nos casos
--
-- Depends on: 00004_cases, 00006_documents

BEGIN;

-- =============================================================================
-- EXCEPTIONS (Excecoes/Problemas encontrados)
-- =============================================================================

CREATE TABLE exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculos
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    validation_id UUID REFERENCES validations(id) ON DELETE SET NULL,

    -- Classificacao
    exception_type exception_type NOT NULL,
    severity exception_severity NOT NULL DEFAULT 'medium',
    status exception_status NOT NULL DEFAULT 'open',

    -- Detalhes
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    affected_field TEXT,                            -- Campo afetado (se aplicavel)

    -- Sugestao de resolucao
    suggested_action TEXT,                         -- Acao sugerida pela IA
    auto_resolvable BOOLEAN NOT NULL DEFAULT false, -- Se pode ser resolvido automaticamente

    -- Resolucao
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    resolution_action TEXT,                        -- Acao tomada para resolver

    -- Pipeline
    blocks_pipeline BOOLEAN NOT NULL DEFAULT true, -- Se bloqueia o progresso do caso
    pipeline_step TEXT,                            -- Em qual etapa do pipeline surgiu

    -- Metadados
    metadata JSONB DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "detected_by": "ai_validation",
    --   "ai_confidence": 0.95,
    --   "related_exceptions": ["uuid1", "uuid2"],
    --   "retry_count": 0,
    --   "max_retries": 3
    -- }

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_exceptions_org ON exceptions(org_id);
CREATE INDEX idx_exceptions_case ON exceptions(case_id);
CREATE INDEX idx_exceptions_case_status ON exceptions(case_id, status);
CREATE INDEX idx_exceptions_document ON exceptions(document_id)
    WHERE document_id IS NOT NULL;
CREATE INDEX idx_exceptions_open ON exceptions(org_id, status)
    WHERE status = 'open';
CREATE INDEX idx_exceptions_severity ON exceptions(org_id, severity, status)
    WHERE status IN ('open', 'in_review');
CREATE INDEX idx_exceptions_blocking ON exceptions(case_id, blocks_pipeline)
    WHERE blocks_pipeline = true AND status = 'open';
CREATE INDEX idx_exceptions_type ON exceptions(org_id, exception_type);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_exceptions_updated_at
    BEFORE UPDATE ON exceptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ao resolver todas as excecoes blocking, verificar se caso pode avancar
CREATE OR REPLACE FUNCTION check_case_unblocked()
RETURNS TRIGGER AS $$
BEGIN
    -- Se uma excecao blocking foi resolvida
    IF OLD.status = 'open' AND NEW.status IN ('resolved', 'dismissed')
       AND OLD.blocks_pipeline = true THEN
        -- Verificar se ainda existem excecoes blocking abertas
        IF NOT EXISTS (
            SELECT 1 FROM exceptions
            WHERE case_id = NEW.case_id
            AND id != NEW.id
            AND blocks_pipeline = true
            AND status = 'open'
        ) THEN
            -- Notificar (via pg_notify para o backend)
            PERFORM pg_notify(
                'case_unblocked',
                json_build_object(
                    'case_id', NEW.case_id,
                    'org_id', NEW.org_id,
                    'resolved_exception_id', NEW.id
                )::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_exceptions_check_unblocked
    AFTER UPDATE ON exceptions
    FOR EACH ROW
    EXECUTE FUNCTION check_case_unblocked();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE exceptions IS 'Excecoes e problemas detectados durante o processamento de casos';
COMMENT ON COLUMN exceptions.exception_type IS 'Tipo: missing_signature, incomplete_data, atypical_action, etc.';
COMMENT ON COLUMN exceptions.severity IS 'Severidade: low, medium, high, critical';
COMMENT ON COLUMN exceptions.status IS 'Status: open, in_review, resolved, dismissed';
COMMENT ON COLUMN exceptions.blocks_pipeline IS 'Se true, bloqueia o avanco do caso no pipeline';
COMMENT ON COLUMN exceptions.pipeline_step IS 'Etapa do pipeline onde o problema foi detectado';
COMMENT ON COLUMN exceptions.auto_resolvable IS 'Se a excecao pode ser resolvida automaticamente pelo sistema';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'exceptions'
    )), 'Table exceptions was not created';

    RAISE NOTICE 'Migration 00010: Exceptions table created successfully';
END $$;

COMMIT;
