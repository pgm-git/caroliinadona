-- Migration: 00008_calculations_and_status_history
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Calculos de divida e historico de status
--
-- Depends on: 00004_cases

BEGIN;

-- =============================================================================
-- CALCULATIONS (Calculos de divida)
-- =============================================================================

CREATE TABLE calculations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculo
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Dados base do calculo
    principal_amount DECIMAL(15,2) NOT NULL,       -- Valor principal
    contract_date DATE NOT NULL,                   -- Data do contrato
    default_date DATE NOT NULL,                    -- Data da inadimplencia
    calculation_date DATE NOT NULL,                -- Data do calculo (data base)

    -- Parametros de correcao
    correction_index correction_index NOT NULL,
    interest_rate_monthly DECIMAL(8,6) NOT NULL,   -- Taxa de juros mensal (ex: 0.015 = 1.5%)
    penalty_rate DECIMAL(8,4) NOT NULL DEFAULT 0,  -- Multa (ex: 2.00 = 2%)
    attorney_fees_rate DECIMAL(8,4) NOT NULL DEFAULT 0, -- Honorarios (ex: 10.00 = 10%)

    -- Resultado do calculo
    corrected_amount DECIMAL(15,2) NOT NULL,       -- Valor corrigido monetariamente
    interest_amount DECIMAL(15,2) NOT NULL,        -- Juros acumulados
    penalty_amount DECIMAL(15,2) NOT NULL,         -- Valor da multa
    attorney_fees_amount DECIMAL(15,2) NOT NULL,   -- Valor dos honorarios
    court_costs DECIMAL(15,2) NOT NULL DEFAULT 0,  -- Custas judiciais
    other_charges DECIMAL(15,2) NOT NULL DEFAULT 0, -- Outras despesas
    total_amount DECIMAL(15,2) NOT NULL,           -- TOTAL da divida atualizada

    -- Detalhamento mensal (planilha de calculo)
    monthly_breakdown JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Estrutura:
    -- [
    --   {
    --     "month": "2025-01",
    --     "opening_balance": 50000.00,
    --     "correction_factor": 1.0045,
    --     "corrected_balance": 50225.00,
    --     "interest": 753.38,
    --     "closing_balance": 50978.38
    --   },
    --   ...
    -- ]

    -- Indices utilizados
    index_values JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "igpm": {
    --     "2025-01": 0.45,
    --     "2025-02": 0.32,
    --     ...
    --   }
    -- }

    -- Status
    is_current BOOLEAN NOT NULL DEFAULT true,      -- Se este e o calculo vigente
    version INTEGER NOT NULL DEFAULT 1,
    superseded_by UUID REFERENCES calculations(id),

    -- Validacao
    is_validated BOOLEAN NOT NULL DEFAULT false,
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMPTZ,
    validation_notes TEXT,

    -- Quem calculou
    calculated_by UUID REFERENCES users(id),       -- NULL = sistema/IA
    calculation_method TEXT NOT NULL DEFAULT 'automated'
        CHECK (calculation_method IN ('automated', 'manual', 'hybrid')),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - CALCULATIONS
-- =============================================================================

CREATE INDEX idx_calculations_org ON calculations(org_id);
CREATE INDEX idx_calculations_case ON calculations(case_id);
CREATE INDEX idx_calculations_current ON calculations(case_id, is_current)
    WHERE is_current = true;
CREATE INDEX idx_calculations_validation ON calculations(org_id, is_validated)
    WHERE is_validated = false AND is_current = true;

-- Apenas um calculo vigente por caso
CREATE UNIQUE INDEX idx_calculations_one_current ON calculations(case_id)
    WHERE is_current = true;

-- =============================================================================
-- STATUS_HISTORY (Historico de mudancas de status)
-- =============================================================================

CREATE TABLE status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculo
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Status transition
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,

    -- Quem mudou
    changed_by UUID REFERENCES users(id),          -- NULL = sistema automatico

    -- Detalhes
    reason TEXT,                                   -- Motivo da mudanca
    metadata JSONB DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "trigger": "ai_pipeline",
    --   "step": "extraction",
    --   "duration_seconds": 45,
    --   "auto": true
    -- }

    -- Timestamp
    changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES - STATUS_HISTORY
-- =============================================================================

CREATE INDEX idx_status_history_org ON status_history(org_id);
CREATE INDEX idx_status_history_case ON status_history(case_id);
CREATE INDEX idx_status_history_case_at ON status_history(case_id, changed_at DESC);
CREATE INDEX idx_status_history_status ON status_history(new_status, changed_at DESC);

-- =============================================================================
-- ATIVAR O TRIGGER DE STATUS CHANGE NO CASES
-- =============================================================================

-- Agora que status_history existe, podemos criar o trigger
DROP TRIGGER IF EXISTS trigger_cases_status_change ON cases;
CREATE TRIGGER trigger_cases_status_change
    BEFORE UPDATE ON cases
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION cases_status_change_trigger();

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_calculations_updated_at
    BEFORE UPDATE ON calculations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ao inserir novo calculo, desativar o anterior
CREATE OR REPLACE FUNCTION deactivate_previous_calculation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_current = true THEN
        UPDATE calculations
        SET is_current = false,
            superseded_by = NEW.id,
            updated_at = NOW()
        WHERE case_id = NEW.case_id
        AND id != NEW.id
        AND is_current = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculations_deactivate_previous
    AFTER INSERT ON calculations
    FOR EACH ROW
    WHEN (NEW.is_current = true)
    EXECUTE FUNCTION deactivate_previous_calculation();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE calculations IS 'Calculos de divida atualizada com detalhamento mensal';
COMMENT ON COLUMN calculations.principal_amount IS 'Valor principal original da divida';
COMMENT ON COLUMN calculations.total_amount IS 'Valor total atualizado (principal + correcao + juros + multa + honorarios)';
COMMENT ON COLUMN calculations.monthly_breakdown IS 'Planilha de calculo mensal em JSON';
COMMENT ON COLUMN calculations.is_current IS 'Se este e o calculo vigente (apenas 1 por caso)';
COMMENT ON COLUMN calculations.index_values IS 'Valores dos indices de correcao utilizados';
COMMENT ON COLUMN calculations.calculation_method IS 'Metodo: automated (IA), manual (humano), hybrid';

COMMENT ON TABLE status_history IS 'Log imutavel de todas as transicoes de status dos casos';
COMMENT ON COLUMN status_history.changed_by IS 'NULL indica mudanca automatica pelo sistema';
COMMENT ON COLUMN status_history.metadata IS 'Metadados: trigger, step, duration, auto';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'calculations'
    )), 'Table calculations was not created';

    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'status_history'
    )), 'Table status_history was not created';

    RAISE NOTICE 'Migration 00008: Calculations and status_history created successfully';
END $$;

COMMIT;
