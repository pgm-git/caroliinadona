-- Migration: 00005_parties
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Partes dos processos (devedores, avalistas, credores)
--
-- Depends on: 00004_cases

BEGIN;

-- =============================================================================
-- PARTIES (Partes do processo)
-- =============================================================================

CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Vinculo ao caso
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,

    -- Classificacao
    role party_role NOT NULL,
    person_type person_type NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,    -- Parte principal (devedor principal, etc.)

    -- Identificacao - Pessoa Fisica
    full_name TEXT NOT NULL,
    cpf VARCHAR(14),                              -- CPF formatado: 000.000.000-00
    rg VARCHAR(20),
    rg_issuer VARCHAR(20),                        -- Orgao emissor (SSP/SP, etc.)
    birth_date DATE,
    nationality VARCHAR(50) DEFAULT 'brasileira',
    marital_status VARCHAR(20),                   -- solteiro, casado, divorciado, viuvo, uniao_estavel
    profession VARCHAR(100),

    -- Identificacao - Pessoa Juridica
    company_name TEXT,                            -- Razao social
    trade_name TEXT,                              -- Nome fantasia
    cnpj VARCHAR(18),                             -- CNPJ formatado
    state_registration VARCHAR(20),               -- Inscricao estadual
    legal_representative TEXT,                    -- Representante legal

    -- Contato
    email TEXT,
    phone VARCHAR(20),
    mobile VARCHAR(20),

    -- Endereco (para citacao)
    address_street TEXT,
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),

    -- Endereco alternativo
    alt_address_street TEXT,
    alt_address_city VARCHAR(100),
    alt_address_state VARCHAR(2),
    alt_address_zip VARCHAR(10),

    -- Dados bancarios (quando credor)
    bank_name VARCHAR(100),
    bank_branch VARCHAR(20),
    bank_account VARCHAR(30),
    bank_account_type VARCHAR(20),                -- corrente, poupanca

    -- Metadados
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "source": "extracted_from_ccb",
    --   "extraction_confidence": 0.92,
    --   "serasa_score": 450,
    --   "has_other_lawsuits": true,
    --   "assets_found": ["imovel_sp", "veiculo"]
    -- }
    notes TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Multi-tenancy
CREATE INDEX idx_parties_org_id ON parties(org_id);

-- Caso (query principal: buscar partes de um caso)
CREATE INDEX idx_parties_case_id ON parties(case_id);
CREATE INDEX idx_parties_case_role ON parties(case_id, role);

-- CPF/CNPJ (busca de partes em outros processos)
CREATE INDEX idx_parties_cpf ON parties(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_parties_cnpj ON parties(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_parties_org_cpf ON parties(org_id, cpf) WHERE cpf IS NOT NULL;
CREATE INDEX idx_parties_org_cnpj ON parties(org_id, cnpj) WHERE cnpj IS NOT NULL;

-- Nome (busca por nome)
CREATE INDEX idx_parties_name_trgm ON parties USING gin (full_name gin_trgm_ops);

-- Parte principal
CREATE INDEX idx_parties_primary ON parties(case_id, is_primary) WHERE is_primary = true;

-- =============================================================================
-- CONSTRAINTS
-- =============================================================================

-- CPF valido: 11 digitos (sem formatacao) ou formato XXX.XXX.XXX-XX
ALTER TABLE parties ADD CONSTRAINT chk_parties_cpf_format
    CHECK (cpf IS NULL OR cpf ~ '^\d{3}\.\d{3}\.\d{3}-\d{2}$');

-- CNPJ valido: formato XX.XXX.XXX/XXXX-XX
ALTER TABLE parties ADD CONSTRAINT chk_parties_cnpj_format
    CHECK (cnpj IS NULL OR cnpj ~ '^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$');

-- Pessoa fisica deve ter CPF ou pessoa juridica deve ter CNPJ
ALTER TABLE parties ADD CONSTRAINT chk_parties_document
    CHECK (
        (person_type = 'individual' AND cpf IS NOT NULL)
        OR (person_type = 'company' AND cnpj IS NOT NULL)
        OR (cpf IS NOT NULL OR cnpj IS NOT NULL) -- ao menos um dos dois
    );

-- Pessoa juridica deve ter company_name
ALTER TABLE parties ADD CONSTRAINT chk_parties_company_name
    CHECK (person_type != 'company' OR company_name IS NOT NULL);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

CREATE TRIGGER trigger_parties_updated_at
    BEFORE UPDATE ON parties
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE parties IS 'Partes envolvidas nos processos: devedores, avalistas, credores, etc.';
COMMENT ON COLUMN parties.role IS 'Papel da parte: debtor, guarantor, creditor, co_debtor, surety';
COMMENT ON COLUMN parties.person_type IS 'Tipo de pessoa: individual (PF) ou company (PJ)';
COMMENT ON COLUMN parties.is_primary IS 'Se esta e a parte principal no papel (ex: devedor principal)';
COMMENT ON COLUMN parties.cpf IS 'CPF formatado: 000.000.000-00';
COMMENT ON COLUMN parties.cnpj IS 'CNPJ formatado: 00.000.000/0000-00';
COMMENT ON COLUMN parties.metadata IS 'Metadados: fonte de extracao, score, assets encontrados';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'parties'
    )), 'Table parties was not created';

    RAISE NOTICE 'Migration 00005: Parties table created successfully';
END $$;

COMMIT;
