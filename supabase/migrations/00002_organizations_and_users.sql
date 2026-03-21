-- Migration: 00002_organizations_and_users
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Tabelas de organizacoes (multi-tenancy) e usuarios
--
-- Depends on: 00001_extensions_and_functions

BEGIN;

-- =============================================================================
-- ORGANIZATIONS (Escritorios de advocacia)
-- =============================================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificacao
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    cnpj VARCHAR(18) UNIQUE,           -- CNPJ formatado: 00.000.000/0000-00
    oab_number VARCHAR(20),            -- Numero OAB do escritorio

    -- Contato
    email TEXT,
    phone VARCHAR(20),
    website TEXT,

    -- Endereco
    address_street TEXT,
    address_number VARCHAR(20),
    address_complement VARCHAR(100),
    address_neighborhood VARCHAR(100),
    address_city VARCHAR(100),
    address_state VARCHAR(2),
    address_zip VARCHAR(10),

    -- Configuracoes
    settings JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo de settings:
    -- {
    --   "default_court_id": "uuid",
    --   "default_correction_index": "igpm",
    --   "auto_calculate": true,
    --   "notification_email": "alerts@escritorio.com",
    --   "max_cases_per_batch": 50,
    --   "petition_review_required": true,
    --   "lgpd_consent_text": "...",
    --   "branding": { "logo_url": "...", "primary_color": "#..." }
    -- }

    -- Plano/Limites
    plan TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    max_users INTEGER NOT NULL DEFAULT 5,
    max_cases_per_month INTEGER NOT NULL DEFAULT 100,
    storage_limit_gb INTEGER NOT NULL DEFAULT 10,

    -- LGPD
    lgpd_dpo_name TEXT,                -- Data Protection Officer
    lgpd_dpo_email TEXT,
    lgpd_privacy_policy_url TEXT,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ              -- Soft delete
);

-- Indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_cnpj ON organizations(cnpj) WHERE cnpj IS NOT NULL;
CREATE INDEX idx_organizations_is_active ON organizations(is_active) WHERE is_active = true;
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- Updated_at trigger
CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE organizations IS 'Escritorios de advocacia (tenants do sistema multi-tenant)';
COMMENT ON COLUMN organizations.slug IS 'Identificador URL-friendly unico do escritorio';
COMMENT ON COLUMN organizations.settings IS 'Configuracoes JSON do escritorio (court padrao, indices, etc.)';
COMMENT ON COLUMN organizations.plan IS 'Plano de assinatura: starter, professional, enterprise';
COMMENT ON COLUMN organizations.deleted_at IS 'Soft delete - quando preenchido, escritorio esta inativo';

-- =============================================================================
-- USERS (Perfil estendido do auth.users do Supabase)
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Identificacao
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,

    -- Dados profissionais
    oab_number VARCHAR(20),            -- Numero OAB individual
    oab_state VARCHAR(2),              -- Estado da OAB

    -- Preferencias
    preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "theme": "dark",
    --   "notifications": { "email": true, "push": true },
    --   "default_view": "kanban",
    --   "timezone": "America/Sao_Paulo",
    --   "language": "pt-BR"
    -- }

    -- LGPD
    lgpd_consent_at TIMESTAMPTZ,       -- Data do consentimento LGPD
    lgpd_consent_version TEXT,          -- Versao do termo aceito

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oab ON users(oab_number, oab_state) WHERE oab_number IS NOT NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE users IS 'Perfil estendido dos usuarios (vinculado ao auth.users do Supabase)';
COMMENT ON COLUMN users.id IS 'FK para auth.users(id) - mesmo UUID do Supabase Auth';
COMMENT ON COLUMN users.oab_number IS 'Numero de inscricao na OAB';
COMMENT ON COLUMN users.lgpd_consent_at IS 'Timestamp do aceite do termo LGPD';

-- =============================================================================
-- ORG_MEMBERS (Vinculo usuario <-> organizacao)
-- =============================================================================

CREATE TABLE org_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Role e permissoes
    role user_role NOT NULL DEFAULT 'intern',
    permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
    -- Permissoes granulares opcionais:
    -- ["cases:read", "cases:write", "petitions:generate", "petitions:file", "reports:view"]

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    UNIQUE(org_id, user_id)
);

-- Indexes
CREATE INDEX idx_org_members_user_id ON org_members(user_id);
CREATE INDEX idx_org_members_org_id ON org_members(org_id);
CREATE INDEX idx_org_members_role ON org_members(org_id, role);
CREATE INDEX idx_org_members_active ON org_members(org_id, is_active) WHERE is_active = true;

-- Updated_at trigger
CREATE TRIGGER trigger_org_members_updated_at
    BEFORE UPDATE ON org_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE org_members IS 'Vinculo many-to-many entre usuarios e organizacoes com role e permissoes';
COMMENT ON COLUMN org_members.role IS 'Role do usuario na organizacao: admin, coordinator, lawyer, intern';
COMMENT ON COLUMN org_members.permissions IS 'Permissoes granulares opcionais alem do role';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'organizations'
    )), 'Table organizations was not created';

    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'users'
    )), 'Table users was not created';

    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'org_members'
    )), 'Table org_members was not created';

    RAISE NOTICE 'Migration 00002: Organizations and users created successfully';
END $$;

COMMIT;
