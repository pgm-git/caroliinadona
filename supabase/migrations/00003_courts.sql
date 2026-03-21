-- Migration: 00003_courts
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Tabela de foros e comarcas
--
-- Depends on: 00001_extensions_and_functions

BEGIN;

-- =============================================================================
-- COURTS (Foros e Comarcas)
-- =============================================================================

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificacao
    name TEXT NOT NULL,                          -- Nome completo do foro
    code VARCHAR(20),                            -- Codigo do tribunal (ex: TJSP)
    comarca TEXT NOT NULL,                       -- Comarca
    vara TEXT,                                   -- Vara (quando especifica)
    district TEXT,                               -- Distrito/Foro regional

    -- Tribunal
    tribunal_name TEXT NOT NULL,                  -- Nome do tribunal (ex: Tribunal de Justica do Estado de SP)
    tribunal_acronym VARCHAR(10) NOT NULL,        -- Sigla (ex: TJSP, TJRJ, TRF3)
    justice_type TEXT NOT NULL DEFAULT 'estadual' -- Tipo de justica
        CHECK (justice_type IN ('estadual', 'federal', 'trabalho', 'militar', 'eleitoral')),

    -- Localizacao
    state VARCHAR(2) NOT NULL,                   -- UF
    city TEXT NOT NULL,
    address TEXT,
    zip_code VARCHAR(10),

    -- Protocolo eletronico
    electronic_filing BOOLEAN NOT NULL DEFAULT false,
    filing_system TEXT,                           -- Sistema de protocolo (PJe, eSAJ, PROJUDI, etc.)
    filing_url TEXT,                              -- URL do sistema de protocolo

    -- Contato
    phone VARCHAR(20),
    email TEXT,

    -- Dados operacionais
    business_hours TEXT,                          -- Horario de funcionamento
    notes TEXT,                                   -- Observacoes

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_courts_tribunal ON courts(tribunal_acronym);
CREATE INDEX idx_courts_state ON courts(state);
CREATE INDEX idx_courts_comarca ON courts(comarca);
CREATE INDEX idx_courts_state_comarca ON courts(state, comarca);
CREATE INDEX idx_courts_code ON courts(code) WHERE code IS NOT NULL;
CREATE INDEX idx_courts_filing_system ON courts(filing_system) WHERE filing_system IS NOT NULL;

-- Busca por nome com trigram
CREATE INDEX idx_courts_name_trgm ON courts USING gin (name gin_trgm_ops);

-- Updated_at trigger
CREATE TRIGGER trigger_courts_updated_at
    BEFORE UPDATE ON courts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE courts IS 'Foros, comarcas e varas para protocolo de peticoes';
COMMENT ON COLUMN courts.tribunal_acronym IS 'Sigla do tribunal: TJSP, TJRJ, TRF3, etc.';
COMMENT ON COLUMN courts.filing_system IS 'Sistema de protocolo eletronico: PJe, eSAJ, PROJUDI, etc.';
COMMENT ON COLUMN courts.electronic_filing IS 'Se o foro aceita protocolo eletronico';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'courts'
    )), 'Table courts was not created';

    RAISE NOTICE 'Migration 00003: Courts table created successfully';
END $$;

COMMIT;
