-- Migration: 00004_cases
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Tabela central de casos/processos
--
-- Depends on: 00002_organizations_and_users, 00003_courts

BEGIN;

-- =============================================================================
-- CASES (Processos/Casos - Entidade Central)
-- =============================================================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Identificacao
    case_number VARCHAR(50),                     -- Numero do processo (quando protocolado)
    internal_reference VARCHAR(50) NOT NULL,      -- Referencia interna do escritorio
    title TEXT NOT NULL,                          -- Titulo descritivo
    description TEXT,                             -- Descricao detalhada

    -- Classificacao
    case_type case_type NOT NULL,
    status case_status NOT NULL DEFAULT 'received',
    priority INTEGER NOT NULL DEFAULT 3           -- 1 (urgente) a 5 (baixa)
        CHECK (priority BETWEEN 1 AND 5),

    -- Foro
    court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
    jurisdiction_notes TEXT,                       -- Observacoes sobre competencia

    -- Valores
    principal_amount DECIMAL(15,2),               -- Valor principal da divida
    interest_amount DECIMAL(15,2),                -- Juros calculados
    correction_amount DECIMAL(15,2),              -- Correcao monetaria
    fees_amount DECIMAL(15,2),                    -- Honorarios
    total_amount DECIMAL(15,2),                   -- Valor total atualizado
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',

    -- Contrato/Titulo
    contract_number VARCHAR(100),                 -- Numero do contrato
    contract_date DATE,                           -- Data do contrato
    due_date DATE,                                -- Data de vencimento
    default_date DATE,                            -- Data da inadimplencia

    -- Correcao monetaria
    correction_index correction_index,             -- Indice de correcao
    interest_rate DECIMAL(8,4),                   -- Taxa de juros (% ao mes)
    penalty_rate DECIMAL(8,4),                    -- Multa (%)
    calculation_base_date DATE,                   -- Data base do calculo

    -- Responsaveis
    assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    assigned_intern_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Datas do pipeline
    received_at TIMESTAMPTZ DEFAULT NOW(),
    analysis_started_at TIMESTAMPTZ,
    extraction_completed_at TIMESTAMPTZ,
    validation_completed_at TIMESTAMPTZ,
    calculation_completed_at TIMESTAMPTZ,
    petition_generated_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    filed_at TIMESTAMPTZ,

    -- Metadados
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "source": "batch_upload",
    --   "batch_id": "uuid",
    --   "bank_name": "Banco do Brasil",
    --   "branch_code": "0001",
    --   "account_number": "12345-6",
    --   "ai_confidence_score": 0.95,
    --   "tags": ["urgente", "garantia_real"]
    -- }

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ              -- Soft delete
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Multi-tenancy (CRITICO: todo SELECT usa org_id)
CREATE INDEX idx_cases_org_id ON cases(org_id);

-- Status pipeline (query mais frequente: listar por status)
CREATE INDEX idx_cases_org_status ON cases(org_id, status);

-- Busca por numero de processo
CREATE INDEX idx_cases_case_number ON cases(case_number) WHERE case_number IS NOT NULL;
CREATE INDEX idx_cases_org_case_number ON cases(org_id, case_number) WHERE case_number IS NOT NULL;

-- Referencia interna (unica por org)
CREATE UNIQUE INDEX idx_cases_org_internal_ref ON cases(org_id, internal_reference);

-- Tipo + status (filtro comum)
CREATE INDEX idx_cases_org_type_status ON cases(org_id, case_type, status);

-- Responsaveis
CREATE INDEX idx_cases_assigned_lawyer ON cases(assigned_lawyer_id) WHERE assigned_lawyer_id IS NOT NULL;
CREATE INDEX idx_cases_assigned_intern ON cases(assigned_intern_id) WHERE assigned_intern_id IS NOT NULL;

-- Prioridade (ordenacao)
CREATE INDEX idx_cases_org_priority ON cases(org_id, priority, created_at DESC);

-- Data de vencimento (alertas)
CREATE INDEX idx_cases_due_date ON cases(due_date) WHERE due_date IS NOT NULL AND status NOT IN ('filed', 'exception');

-- Busca por titulo
CREATE INDEX idx_cases_title_trgm ON cases USING gin (title gin_trgm_ops);

-- Soft delete filter
CREATE INDEX idx_cases_not_deleted ON cases(org_id, status) WHERE deleted_at IS NULL;

-- Datas do pipeline (relatorios)
CREATE INDEX idx_cases_received_at ON cases(org_id, received_at DESC);
CREATE INDEX idx_cases_filed_at ON cases(org_id, filed_at DESC) WHERE filed_at IS NOT NULL;

-- Court
CREATE INDEX idx_cases_court ON cases(court_id) WHERE court_id IS NOT NULL;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Updated_at
CREATE TRIGGER trigger_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para registrar mudancas de status automaticamente
CREATE OR REPLACE FUNCTION cases_status_change_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Atualizar timestamps do pipeline
        CASE NEW.status
            WHEN 'analyzing' THEN
                NEW.analysis_started_at = COALESCE(NEW.analysis_started_at, NOW());
            WHEN 'extraction_complete' THEN
                NEW.extraction_completed_at = COALESCE(NEW.extraction_completed_at, NOW());
            WHEN 'validated' THEN
                NEW.validation_completed_at = COALESCE(NEW.validation_completed_at, NOW());
            WHEN 'calculated' THEN
                NEW.calculation_completed_at = COALESCE(NEW.calculation_completed_at, NOW());
            WHEN 'petition_generated' THEN
                NEW.petition_generated_at = COALESCE(NEW.petition_generated_at, NOW());
            WHEN 'reviewed' THEN
                NEW.reviewed_at = COALESCE(NEW.reviewed_at, NOW());
            WHEN 'filed' THEN
                NEW.filed_at = COALESCE(NEW.filed_at, NOW());
            ELSE
                -- Nenhuma acao especifica
                NULL;
        END CASE;

        -- Inserir no historico de status
        INSERT INTO status_history (
            case_id,
            org_id,
            previous_status,
            new_status,
            changed_by,
            changed_at
        ) VALUES (
            NEW.id,
            NEW.org_id,
            OLD.status::text,
            NEW.status::text,
            auth.uid(),
            NOW()
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: O trigger sera criado apos a tabela status_history existir (migration 00008)

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE cases IS 'Entidade central: processos de execucao e cobranca bancaria';
COMMENT ON COLUMN cases.org_id IS 'FK para organization - isolamento multi-tenant';
COMMENT ON COLUMN cases.case_number IS 'Numero do processo judicial (preenchido apos protocolo)';
COMMENT ON COLUMN cases.internal_reference IS 'Referencia interna unica por escritorio';
COMMENT ON COLUMN cases.status IS 'Status no pipeline: received -> analyzing -> ... -> filed';
COMMENT ON COLUMN cases.principal_amount IS 'Valor principal da divida em BRL';
COMMENT ON COLUMN cases.total_amount IS 'Valor total atualizado (principal + juros + correcao + honorarios)';
COMMENT ON COLUMN cases.correction_index IS 'Indice de correcao monetaria aplicavel';
COMMENT ON COLUMN cases.metadata IS 'Metadados flexiveis: source, batch_id, bank_name, ai_confidence, tags';
COMMENT ON COLUMN cases.deleted_at IS 'Soft delete timestamp - quando NOT NULL, caso esta removido';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'cases'
    )), 'Table cases was not created';

    RAISE NOTICE 'Migration 00004: Cases table created successfully';
END $$;

COMMIT;
