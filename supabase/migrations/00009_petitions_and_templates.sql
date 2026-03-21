-- Migration: 00009_petitions_and_templates
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Templates de peticao e peticoes geradas
--
-- Depends on: 00004_cases, 00003_courts

BEGIN;

-- =============================================================================
-- PETITION_TEMPLATES (Templates de peticao)
-- =============================================================================

CREATE TABLE petition_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy (NULL = template global do sistema)
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Identificacao
    name TEXT NOT NULL,
    description TEXT,
    template_code VARCHAR(50) NOT NULL,            -- Codigo unico: EXEC-CCB, EXEC-CHEQUE, COB-CONTRATO
    version INTEGER NOT NULL DEFAULT 1,

    -- Classificacao
    case_type case_type NOT NULL,
    applicable_document_types document_type[] NOT NULL DEFAULT '{}',
    -- Ex: '{credit_certificate,contract}' para CCB com contrato

    -- Template
    template_body TEXT NOT NULL,                    -- Template com variaveis {{variavel}}
    template_format TEXT NOT NULL DEFAULT 'html'
        CHECK (template_format IN ('html', 'markdown', 'docx_template')),

    -- Variaveis necessarias
    required_variables JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Exemplo:
    -- [
    --   { "name": "debtor_name", "type": "string", "required": true },
    --   { "name": "debtor_cpf", "type": "string", "required": true },
    --   { "name": "principal_amount", "type": "currency", "required": true },
    --   { "name": "total_amount", "type": "currency", "required": true },
    --   { "name": "court_name", "type": "string", "required": true },
    --   { "name": "contract_number", "type": "string", "required": false }
    -- ]

    -- Tribunal (se template especifico para tribunal)
    court_state VARCHAR(2),                        -- Se especifico para UF
    tribunal_acronym VARCHAR(10),                  -- Se especifico para tribunal

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system BOOLEAN NOT NULL DEFAULT false,      -- Template do sistema (imutavel por org)

    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - PETITION_TEMPLATES
-- =============================================================================

CREATE INDEX idx_petition_templates_org ON petition_templates(org_id) WHERE org_id IS NOT NULL;
CREATE INDEX idx_petition_templates_type ON petition_templates(case_type);
CREATE INDEX idx_petition_templates_code ON petition_templates(template_code);
CREATE INDEX idx_petition_templates_active ON petition_templates(org_id, is_active)
    WHERE is_active = true;
CREATE INDEX idx_petition_templates_system ON petition_templates(is_system)
    WHERE is_system = true;
CREATE INDEX idx_petition_templates_state ON petition_templates(court_state)
    WHERE court_state IS NOT NULL;

-- Template code unico por org (ou global)
CREATE UNIQUE INDEX idx_petition_templates_org_code_version
    ON petition_templates(COALESCE(org_id, '00000000-0000-0000-0000-000000000000'), template_code, version);

-- =============================================================================
-- PETITIONS (Peticoes geradas)
-- =============================================================================

CREATE TABLE petitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculos
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    template_id UUID REFERENCES petition_templates(id) ON DELETE SET NULL,
    calculation_id UUID REFERENCES calculations(id) ON DELETE SET NULL,
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,

    -- Identificacao
    title TEXT NOT NULL,
    petition_type TEXT NOT NULL,                   -- Tipo: initial, amendment, appeal, enforcement
    version INTEGER NOT NULL DEFAULT 1,

    -- Conteudo
    content_html TEXT,                             -- Peticao em HTML
    content_text TEXT,                             -- Peticao em texto puro
    variables_used JSONB NOT NULL DEFAULT '{}'::JSONB, -- Variaveis substituidas no template

    -- Arquivo gerado
    storage_bucket TEXT DEFAULT 'petitions',
    storage_path TEXT,                             -- Path no bucket: {org_id}/{case_id}/petition-v{version}.pdf
    file_size_bytes BIGINT,

    -- Status
    status petition_status NOT NULL DEFAULT 'draft',

    -- Geracao
    generated_by TEXT NOT NULL DEFAULT 'ai'        -- 'ai', 'manual', 'hybrid'
        CHECK (generated_by IN ('ai', 'manual', 'hybrid')),
    ai_model TEXT,                                 -- Modelo de IA usado
    generation_prompt_hash VARCHAR(64),            -- Hash do prompt (rastreabilidade)

    -- Revisao
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    changes_made JSONB DEFAULT '[]'::JSONB,        -- Lista de alteracoes do revisor

    -- Protocolo
    filed_by UUID REFERENCES users(id),
    filed_at TIMESTAMPTZ,
    filing_number VARCHAR(50),                     -- Numero do protocolo
    filing_court_id UUID REFERENCES courts(id),
    filing_receipt_path TEXT,                       -- Path do comprovante de protocolo

    -- Audit
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - PETITIONS
-- =============================================================================

CREATE INDEX idx_petitions_org ON petitions(org_id);
CREATE INDEX idx_petitions_case ON petitions(case_id);
CREATE INDEX idx_petitions_case_status ON petitions(case_id, status);
CREATE INDEX idx_petitions_template ON petitions(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_petitions_status ON petitions(org_id, status);
CREATE INDEX idx_petitions_filed ON petitions(org_id, filed_at DESC)
    WHERE filed_at IS NOT NULL;
CREATE INDEX idx_petitions_review ON petitions(org_id, status)
    WHERE status = 'reviewing';
CREATE INDEX idx_petitions_storage ON petitions(storage_path)
    WHERE storage_path IS NOT NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_petition_templates_updated_at
    BEFORE UPDATE ON petition_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_petitions_updated_at
    BEFORE UPDATE ON petitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE petition_templates IS 'Templates de peticao com variaveis {{variavel}} para geracao automatica';
COMMENT ON COLUMN petition_templates.org_id IS 'NULL = template global do sistema; UUID = template customizado do escritorio';
COMMENT ON COLUMN petition_templates.template_code IS 'Codigo unico do template: EXEC-CCB, EXEC-CHEQUE, COB-CONTRATO';
COMMENT ON COLUMN petition_templates.applicable_document_types IS 'Array de tipos de documento aplicaveis';
COMMENT ON COLUMN petition_templates.required_variables IS 'Variaveis necessarias com tipo e obrigatoriedade';
COMMENT ON COLUMN petition_templates.is_system IS 'Template do sistema (nao pode ser editado pela organizacao)';

COMMENT ON TABLE petitions IS 'Peticoes geradas (por IA ou manualmente) vinculadas a casos';
COMMENT ON COLUMN petitions.status IS 'Status: draft, generated, reviewing, approved, filed, rejected';
COMMENT ON COLUMN petitions.content_html IS 'Conteudo da peticao em HTML renderizado';
COMMENT ON COLUMN petitions.variables_used IS 'Snapshot das variaveis usadas na geracao';
COMMENT ON COLUMN petitions.filing_number IS 'Numero de protocolo no tribunal';
COMMENT ON COLUMN petitions.changes_made IS 'Lista de alteracoes feitas pelo revisor';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'petition_templates'
    )), 'Table petition_templates was not created';

    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'petitions'
    )), 'Table petitions was not created';

    RAISE NOTICE 'Migration 00009: Petition templates and petitions created successfully';
END $$;

COMMIT;
