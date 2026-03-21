-- Migration: 00011_audit_log
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Log de auditoria para LGPD compliance e rastreabilidade
--
-- Depends on: 00002_organizations_and_users

BEGIN;

-- =============================================================================
-- AUDIT_LOG (Log de auditoria - LGPD compliance)
-- =============================================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Multi-tenancy
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,

    -- Acao
    action audit_action NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,                               -- ID do registro afetado

    -- Quem
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email TEXT,                               -- Snapshot do email (caso usuario seja deletado)
    user_role TEXT,                                -- Role no momento da acao
    ip_address INET,                               -- IP do usuario
    user_agent TEXT,                               -- User-Agent do browser

    -- O que mudou
    old_data JSONB,                                -- Dados anteriores (UPDATE/DELETE)
    new_data JSONB,                                -- Dados novos (INSERT/UPDATE)
    changed_fields TEXT[],                         -- Lista de campos alterados

    -- Contexto
    description TEXT,                              -- Descricao legivel da acao
    metadata JSONB DEFAULT '{}'::JSONB,
    -- Exemplo:
    -- {
    --   "request_id": "uuid",
    --   "session_id": "uuid",
    --   "endpoint": "/api/cases/123",
    --   "method": "PUT",
    --   "case_id": "uuid",
    --   "story_id": "EXEC-2025-001"
    -- }

    -- LGPD
    contains_pii BOOLEAN NOT NULL DEFAULT false,   -- Se contem dados pessoais
    data_subject_id UUID,                          -- ID do titular dos dados (LGPD)
    legal_basis TEXT,                              -- Base legal do tratamento
    retention_until TIMESTAMPTZ,                   -- Data maxima de retencao

    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    -- Nota: audit_log NAO tem updated_at (registros sao imutaveis)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Multi-tenancy
CREATE INDEX idx_audit_log_org ON audit_log(org_id);

-- Busca por acao e tabela
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at DESC);
CREATE INDEX idx_audit_log_table ON audit_log(table_name, created_at DESC);
CREATE INDEX idx_audit_log_org_table ON audit_log(org_id, table_name, created_at DESC);

-- Busca por usuario
CREATE INDEX idx_audit_log_user ON audit_log(user_id, created_at DESC)
    WHERE user_id IS NOT NULL;

-- Busca por registro
CREATE INDEX idx_audit_log_record ON audit_log(table_name, record_id)
    WHERE record_id IS NOT NULL;

-- LGPD: busca por titular
CREATE INDEX idx_audit_log_data_subject ON audit_log(data_subject_id)
    WHERE data_subject_id IS NOT NULL;

-- LGPD: retencao
CREATE INDEX idx_audit_log_retention ON audit_log(retention_until)
    WHERE retention_until IS NOT NULL;

-- Timeline (relatorios)
CREATE INDEX idx_audit_log_org_timeline ON audit_log(org_id, created_at DESC);

-- PII filter
CREATE INDEX idx_audit_log_pii ON audit_log(org_id, contains_pii)
    WHERE contains_pii = true;

-- =============================================================================
-- PARTICIONAMENTO (Recomendado para producao com alto volume)
-- =============================================================================

-- Nota: O particionamento por range de created_at e recomendado quando
-- o volume de audit_log exceder 10M de registros. Implementar como
-- migration separada quando necessario:
--
-- CREATE TABLE audit_log_partitioned (
--     LIKE audit_log INCLUDING ALL
-- ) PARTITION BY RANGE (created_at);
--
-- CREATE TABLE audit_log_y2026_q1 PARTITION OF audit_log_partitioned
--     FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
-- ...

-- =============================================================================
-- FUNCAO DE AUDITORIA GENERICA
-- =============================================================================

-- Trigger function para audit automatico em qualquer tabela
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    v_old_data JSONB;
    v_new_data JSONB;
    v_changed_fields TEXT[];
    v_org_id UUID;
    v_action audit_action;
BEGIN
    -- Determinar acao
    v_action = TG_OP::audit_action;

    -- Capturar dados
    IF TG_OP = 'DELETE' THEN
        v_old_data = to_jsonb(OLD);
        v_org_id = OLD.org_id;
    ELSIF TG_OP = 'INSERT' THEN
        v_new_data = to_jsonb(NEW);
        v_org_id = NEW.org_id;
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data = to_jsonb(OLD);
        v_new_data = to_jsonb(NEW);
        v_org_id = NEW.org_id;

        -- Identificar campos alterados
        SELECT array_agg(key) INTO v_changed_fields
        FROM jsonb_each(v_new_data) AS n(key, value)
        WHERE NOT (v_old_data ? key AND v_old_data->key = n.value);
    END IF;

    -- Inserir log (com tratamento para tabelas sem org_id)
    INSERT INTO audit_log (
        org_id,
        action,
        table_name,
        record_id,
        user_id,
        old_data,
        new_data,
        changed_fields
    ) VALUES (
        COALESCE(v_org_id, '00000000-0000-0000-0000-000000000000'),
        v_action,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        auth.uid(),
        v_old_data,
        v_new_data,
        v_changed_fields
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- APLICAR AUDIT TRIGGERS NAS TABELAS PRINCIPAIS
-- =============================================================================

-- Cases (entidade central - auditoria completa)
DROP TRIGGER IF EXISTS trigger_cases_audit ON cases;
CREATE TRIGGER trigger_cases_audit
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Petitions (documento juridico - auditoria completa)
DROP TRIGGER IF EXISTS trigger_petitions_audit ON petitions;
CREATE TRIGGER trigger_petitions_audit
    AFTER INSERT OR UPDATE OR DELETE ON petitions
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Calculations (valores financeiros - auditoria completa)
DROP TRIGGER IF EXISTS trigger_calculations_audit ON calculations;
CREATE TRIGGER trigger_calculations_audit
    AFTER INSERT OR UPDATE OR DELETE ON calculations
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Parties (dados pessoais - LGPD, auditoria completa)
DROP TRIGGER IF EXISTS trigger_parties_audit ON parties;
CREATE TRIGGER trigger_parties_audit
    AFTER INSERT OR UPDATE OR DELETE ON parties
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Documents (upload/processamento)
DROP TRIGGER IF EXISTS trigger_documents_audit ON documents;
CREATE TRIGGER trigger_documents_audit
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Exceptions (resolucao de problemas)
DROP TRIGGER IF EXISTS trigger_exceptions_audit ON exceptions;
CREATE TRIGGER trigger_exceptions_audit
    AFTER INSERT OR UPDATE OR DELETE ON exceptions
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- Org members (controle de acesso)
DROP TRIGGER IF EXISTS trigger_org_members_audit ON org_members;
CREATE TRIGGER trigger_org_members_audit
    AFTER INSERT OR UPDATE OR DELETE ON org_members
    FOR EACH ROW
    EXECUTE FUNCTION audit_trigger_function();

-- =============================================================================
-- FUNCAO LGPD: Anonimizar dados de um titular
-- =============================================================================

CREATE OR REPLACE FUNCTION lgpd_anonymize_subject(
    p_subject_id UUID,
    p_org_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Verificar permissao (apenas admin)
    IF NOT is_org_admin_or_coordinator(p_org_id) THEN
        RAISE EXCEPTION 'Apenas administradores podem anonimizar dados';
    END IF;

    -- Anonimizar partes (devedores, etc.)
    UPDATE parties
    SET full_name = 'ANONIMIZADO',
        cpf = NULL,
        rg = NULL,
        email = NULL,
        phone = NULL,
        mobile = NULL,
        address_street = NULL,
        address_number = NULL,
        address_complement = NULL,
        address_neighborhood = NULL,
        address_city = NULL,
        address_state = NULL,
        address_zip = NULL,
        birth_date = NULL,
        metadata = '{}'::JSONB,
        updated_at = NOW()
    WHERE org_id = p_org_id
    AND id = p_subject_id;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    -- Registrar anonimizacao no audit_log
    INSERT INTO audit_log (
        org_id, action, table_name, record_id, user_id,
        description, contains_pii, data_subject_id, legal_basis
    ) VALUES (
        p_org_id, 'UPDATE', 'parties', p_subject_id, auth.uid(),
        'LGPD: Dados do titular anonimizados por solicitacao',
        true, p_subject_id, 'LGPD Art. 18 - Direito a eliminacao'
    );

    RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FUNCAO LGPD: Exportar dados de um titular (portabilidade)
-- =============================================================================

CREATE OR REPLACE FUNCTION lgpd_export_subject_data(
    p_subject_cpf VARCHAR(14),
    p_org_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Verificar permissao
    IF NOT is_org_admin_or_coordinator(p_org_id) THEN
        RAISE EXCEPTION 'Apenas administradores podem exportar dados de titulares';
    END IF;

    SELECT jsonb_build_object(
        'export_date', NOW(),
        'legal_basis', 'LGPD Art. 18 - Direito a portabilidade',
        'subject_cpf', p_subject_cpf,
        'parties', (
            SELECT jsonb_agg(to_jsonb(p.*) - 'metadata')
            FROM parties p
            WHERE p.cpf = p_subject_cpf AND p.org_id = p_org_id
        ),
        'cases', (
            SELECT jsonb_agg(jsonb_build_object(
                'case_id', c.id,
                'internal_reference', c.internal_reference,
                'case_type', c.case_type,
                'status', c.status,
                'created_at', c.created_at
            ))
            FROM cases c
            JOIN parties p ON p.case_id = c.id
            WHERE p.cpf = p_subject_cpf AND c.org_id = p_org_id
        )
    ) INTO v_result;

    -- Registrar exportacao
    INSERT INTO audit_log (
        org_id, action, table_name, user_id,
        description, contains_pii, legal_basis
    ) VALUES (
        p_org_id, 'EXPORT', 'parties', auth.uid(),
        'LGPD: Exportacao de dados do titular CPF ' || LEFT(p_subject_cpf, 3) || '.***.***-**',
        true, 'LGPD Art. 18 - Direito a portabilidade'
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE audit_log IS 'Log imutavel de auditoria para LGPD compliance e rastreabilidade';
COMMENT ON COLUMN audit_log.action IS 'Tipo da acao: INSERT, UPDATE, DELETE, STATUS_CHANGE, LOGIN, etc.';
COMMENT ON COLUMN audit_log.contains_pii IS 'Flag LGPD: se o registro contem dados pessoais';
COMMENT ON COLUMN audit_log.data_subject_id IS 'ID do titular dos dados para LGPD (direito de acesso)';
COMMENT ON COLUMN audit_log.retention_until IS 'Data maxima de retencao do log (LGPD)';
COMMENT ON COLUMN audit_log.legal_basis IS 'Base legal do tratamento de dados (LGPD)';

COMMENT ON FUNCTION lgpd_anonymize_subject IS 'Anonimiza dados de um titular (LGPD Art. 18)';
COMMENT ON FUNCTION lgpd_export_subject_data IS 'Exporta dados de um titular para portabilidade (LGPD Art. 18)';

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    ASSERT (SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'audit_log'
    )), 'Table audit_log was not created';

    RAISE NOTICE 'Migration 00011: Audit log and LGPD functions created successfully';
END $$;

COMMIT;
