-- Migration: 00007_extracted_data_and_validations
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Dados extraidos pela IA e resultados de validacao
--
-- Depends on: 00004_cases, 00006_documents

BEGIN;

-- =============================================================================
-- EXTRACTED_DATA (Dados extraidos pela IA)
-- =============================================================================

CREATE TABLE extracted_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculos
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Metadados da extracao
    extraction_model TEXT NOT NULL,               -- Modelo de IA usado (gpt-4, claude-3, etc.)
    extraction_version TEXT NOT NULL,              -- Versao do pipeline de extracao
    extraction_prompt_hash VARCHAR(64),            -- Hash do prompt usado (rastreabilidade)
    confidence_score DECIMAL(5,4) NOT NULL         -- Score geral de confianca (0.0000 a 1.0000)
        CHECK (confidence_score BETWEEN 0 AND 1),

    -- Dados extraidos estruturados
    extracted_fields JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Estrutura padrao:
    -- {
    --   "contract_number": { "value": "12345", "confidence": 0.98, "page": 1, "bbox": [x,y,w,h] },
    --   "principal_amount": { "value": 50000.00, "confidence": 0.95, "page": 2 },
    --   "interest_rate": { "value": 1.5, "confidence": 0.90, "unit": "percent_monthly" },
    --   "due_date": { "value": "2025-06-15", "confidence": 0.97 },
    --   "debtor_name": { "value": "Joao Silva", "confidence": 0.99 },
    --   "debtor_cpf": { "value": "123.456.789-00", "confidence": 0.96 },
    --   "creditor_name": { "value": "Banco XYZ S.A.", "confidence": 0.99 },
    --   "guarantee_type": { "value": "alienacao_fiduciaria", "confidence": 0.85 },
    --   "guarantee_description": { "value": "Imovel matricula 12345", "confidence": 0.80 },
    --   "penalty_rate": { "value": 2.0, "confidence": 0.92, "unit": "percent" },
    --   "correction_index": { "value": "igpm", "confidence": 0.88 },
    --   "contract_date": { "value": "2020-01-15", "confidence": 0.97 },
    --   "signatures": [
    --     { "name": "Joao Silva", "role": "debtor", "present": true, "page": 5 }
    --   ]
    -- }

    -- Raw extraction
    raw_extraction TEXT,                           -- Resposta bruta da IA (para debug)

    -- Status
    is_approved BOOLEAN,                           -- NULL=pendente, true=aprovado, false=rejeitado
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - EXTRACTED_DATA
-- =============================================================================

CREATE INDEX idx_extracted_data_org ON extracted_data(org_id);
CREATE INDEX idx_extracted_data_case ON extracted_data(case_id);
CREATE INDEX idx_extracted_data_document ON extracted_data(document_id);
CREATE INDEX idx_extracted_data_case_doc ON extracted_data(case_id, document_id);
CREATE INDEX idx_extracted_data_approval ON extracted_data(is_approved)
    WHERE is_approved IS NULL;
CREATE INDEX idx_extracted_data_confidence ON extracted_data(case_id, confidence_score);

-- GIN index para busca em campos extraidos
CREATE INDEX idx_extracted_data_fields ON extracted_data USING gin (extracted_fields);

-- =============================================================================
-- VALIDATIONS (Resultado das validacoes)
-- =============================================================================

CREATE TABLE validations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculos
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    extracted_data_id UUID REFERENCES extracted_data(id) ON DELETE SET NULL,

    -- Regra de validacao
    rule_code VARCHAR(50) NOT NULL,               -- Codigo da regra (ex: VAL-001, VAL-002)
    rule_name TEXT NOT NULL,                       -- Nome legivel da regra
    rule_category TEXT NOT NULL,                   -- Categoria: data_integrity, legal_requirement, business_rule
    rule_description TEXT,                         -- Descricao detalhada

    -- Resultado
    status validation_status NOT NULL DEFAULT 'pending',
    severity exception_severity NOT NULL DEFAULT 'medium',

    -- Detalhes
    field_name TEXT,                               -- Campo validado (ex: "debtor_cpf")
    expected_value TEXT,                           -- Valor esperado
    actual_value TEXT,                             -- Valor encontrado
    message TEXT NOT NULL,                         -- Mensagem de resultado
    details JSONB DEFAULT '{}'::JSONB,             -- Detalhes adicionais

    -- Resolucao
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - VALIDATIONS
-- =============================================================================

CREATE INDEX idx_validations_org ON validations(org_id);
CREATE INDEX idx_validations_case ON validations(case_id);
CREATE INDEX idx_validations_extracted ON validations(extracted_data_id)
    WHERE extracted_data_id IS NOT NULL;
CREATE INDEX idx_validations_case_status ON validations(case_id, status);
CREATE INDEX idx_validations_case_severity ON validations(case_id, severity)
    WHERE status = 'failed';
CREATE INDEX idx_validations_rule ON validations(rule_code);
CREATE INDEX idx_validations_pending ON validations(org_id, status)
    WHERE status = 'pending';

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_extracted_data_updated_at
    BEFORE UPDATE ON extracted_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_validations_updated_at
    BEFORE UPDATE ON validations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE extracted_data IS 'Dados estruturados extraidos dos documentos pela IA';
COMMENT ON COLUMN extracted_data.extracted_fields IS 'Campos extraidos em JSON: { campo: { value, confidence, page, bbox } }';
COMMENT ON COLUMN extracted_data.confidence_score IS 'Score geral de confianca da extracao (0.0 a 1.0)';
COMMENT ON COLUMN extracted_data.extraction_model IS 'Modelo de IA utilizado na extracao (rastreabilidade)';
COMMENT ON COLUMN extracted_data.is_approved IS 'NULL=pendente de revisao, true=aprovado, false=rejeitado';

COMMENT ON TABLE validations IS 'Resultados das regras de validacao aplicadas aos dados extraidos';
COMMENT ON COLUMN validations.rule_code IS 'Codigo unico da regra: VAL-001, VAL-002, etc.';
COMMENT ON COLUMN validations.rule_category IS 'Categoria: data_integrity, legal_requirement, business_rule';
COMMENT ON COLUMN validations.status IS 'Status: pending, passed, failed, warning';
COMMENT ON COLUMN validations.field_name IS 'Nome do campo validado (ex: debtor_cpf, principal_amount)';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'extracted_data'
    )), 'Table extracted_data was not created';

    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'validations'
    )), 'Table validations was not created';

    RAISE NOTICE 'Migration 00007: Extracted data and validations created successfully';
END $$;

COMMIT;
