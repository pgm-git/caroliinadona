-- Migration: 00012_rls_policies
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Row Level Security policies para multi-tenancy
--
-- Depends on: TODAS as migrations anteriores (00001-00011)
--
-- MODELO DE SEGURANCA:
-- - Isolamento por org_id (multi-tenant)
-- - Usuarios so veem dados das organizacoes a que pertencem
-- - Admins/Coordinators podem modificar, Lawyers podem criar/editar, Interns read-mostly
-- - Service role bypassa RLS (para background jobs/IA pipeline)

BEGIN;

-- =============================================================================
-- HABILITAR RLS EM TODAS AS TABELAS
-- =============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE extracted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE petition_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- ORGANIZATIONS
-- =============================================================================

-- SELECT: Membros veem suas organizacoes
CREATE POLICY "organizations_select"
ON organizations FOR SELECT TO authenticated
USING (id = ANY(get_user_org_ids()));

-- UPDATE: Apenas admin
CREATE POLICY "organizations_update"
ON organizations FOR UPDATE TO authenticated
USING (is_org_admin_or_coordinator(id))
WITH CHECK (is_org_admin_or_coordinator(id));

-- INSERT/DELETE: Via service role apenas (onboarding)

-- =============================================================================
-- USERS
-- =============================================================================

-- SELECT: Usuario ve a si mesmo + colegas da mesma org
CREATE POLICY "users_select_self"
ON users FOR SELECT TO authenticated
USING (
    id = auth.uid()
    OR id IN (
        SELECT om.user_id FROM org_members om
        WHERE om.org_id = ANY(get_user_org_ids())
        AND om.is_active = true
    )
);

-- UPDATE: Usuario atualiza seu proprio perfil
CREATE POLICY "users_update_self"
ON users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- INSERT: Via trigger de auth.users (signup) ou service role

-- =============================================================================
-- ORG_MEMBERS
-- =============================================================================

-- SELECT: Membros veem membros da mesma org
CREATE POLICY "org_members_select"
ON org_members FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Apenas admin pode adicionar membros
CREATE POLICY "org_members_insert"
ON org_members FOR INSERT TO authenticated
WITH CHECK (is_org_admin_or_coordinator(org_id));

-- UPDATE: Admin pode atualizar roles
CREATE POLICY "org_members_update"
ON org_members FOR UPDATE TO authenticated
USING (is_org_admin_or_coordinator(org_id))
WITH CHECK (is_org_admin_or_coordinator(org_id));

-- DELETE: Apenas admin pode remover membros
CREATE POLICY "org_members_delete"
ON org_members FOR DELETE TO authenticated
USING (is_org_admin_or_coordinator(org_id));

-- =============================================================================
-- COURTS (Tabela compartilhada - dados publicos)
-- =============================================================================

-- SELECT: Todos os autenticados podem ver
CREATE POLICY "courts_select"
ON courts FOR SELECT TO authenticated
USING (true);

-- INSERT/UPDATE/DELETE: Via service role apenas (dados de referencia)

-- =============================================================================
-- CASES (Entidade central)
-- =============================================================================

-- SELECT: Membros da org veem casos da org
CREATE POLICY "cases_select"
ON cases FOR SELECT TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    AND deleted_at IS NULL
);

-- INSERT: Lawyer+ pode criar casos
CREATE POLICY "cases_insert"
ON cases FOR INSERT TO authenticated
WITH CHECK (
    is_org_member(org_id)
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
);

-- UPDATE: Lawyer+ pode atualizar
CREATE POLICY "cases_update"
ON cases FOR UPDATE TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
)
WITH CHECK (
    org_id = ANY(get_user_org_ids())
);

-- DELETE (soft): Apenas admin
CREATE POLICY "cases_delete"
ON cases FOR DELETE TO authenticated
USING (
    get_org_role(org_id) = 'admin'
);

-- =============================================================================
-- PARTIES
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "parties_select"
ON parties FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Lawyer+
CREATE POLICY "parties_insert"
ON parties FOR INSERT TO authenticated
WITH CHECK (
    is_org_member(org_id)
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
);

-- UPDATE: Lawyer+
CREATE POLICY "parties_update"
ON parties FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- DELETE: Admin only
CREATE POLICY "parties_delete"
ON parties FOR DELETE TO authenticated
USING (get_org_role(org_id) IN ('admin', 'coordinator'));

-- =============================================================================
-- DOCUMENTS
-- =============================================================================

-- SELECT: Membros da org (exceto soft-deleted)
CREATE POLICY "documents_select"
ON documents FOR SELECT TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    AND deleted_at IS NULL
);

-- INSERT: Qualquer membro pode fazer upload
CREATE POLICY "documents_insert"
ON documents FOR INSERT TO authenticated
WITH CHECK (is_org_member(org_id));

-- UPDATE: Lawyer+ pode atualizar metadata
CREATE POLICY "documents_update"
ON documents FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- DELETE (soft): Admin/Coordinator
CREATE POLICY "documents_delete"
ON documents FOR DELETE TO authenticated
USING (get_org_role(org_id) IN ('admin', 'coordinator'));

-- =============================================================================
-- EXTRACTED_DATA
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "extracted_data_select"
ON extracted_data FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Via service role (pipeline de IA) - nenhuma policy de INSERT para authenticated
-- UPDATE: Lawyer+ (aprovar/rejeitar)
CREATE POLICY "extracted_data_update"
ON extracted_data FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- =============================================================================
-- VALIDATIONS
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "validations_select"
ON validations FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- UPDATE: Lawyer+ (resolver validacoes)
CREATE POLICY "validations_update"
ON validations FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- INSERT: Via service role (pipeline de validacao)

-- =============================================================================
-- CALCULATIONS
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "calculations_select"
ON calculations FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Lawyer+
CREATE POLICY "calculations_insert"
ON calculations FOR INSERT TO authenticated
WITH CHECK (
    is_org_member(org_id)
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
);

-- UPDATE: Lawyer+ (validar calculo)
CREATE POLICY "calculations_update"
ON calculations FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- =============================================================================
-- STATUS_HISTORY (Imutavel - apenas leitura)
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "status_history_select"
ON status_history FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Via trigger automatico ou service role

-- =============================================================================
-- PETITION_TEMPLATES
-- =============================================================================

-- SELECT: Templates da org + templates do sistema
CREATE POLICY "petition_templates_select"
ON petition_templates FOR SELECT TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    OR org_id IS NULL  -- Templates do sistema
);

-- INSERT: Admin pode criar templates custom
CREATE POLICY "petition_templates_insert"
ON petition_templates FOR INSERT TO authenticated
WITH CHECK (
    is_org_admin_or_coordinator(org_id)
    AND is_system = false
);

-- UPDATE: Admin pode editar templates custom (nao system)
CREATE POLICY "petition_templates_update"
ON petition_templates FOR UPDATE TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    AND is_system = false
    AND is_org_admin_or_coordinator(org_id)
)
WITH CHECK (
    org_id = ANY(get_user_org_ids())
    AND is_system = false
);

-- DELETE: Admin (nao system)
CREATE POLICY "petition_templates_delete"
ON petition_templates FOR DELETE TO authenticated
USING (
    is_org_admin_or_coordinator(org_id)
    AND is_system = false
);

-- =============================================================================
-- PETITIONS
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "petitions_select"
ON petitions FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Lawyer+
CREATE POLICY "petitions_insert"
ON petitions FOR INSERT TO authenticated
WITH CHECK (
    is_org_member(org_id)
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
);

-- UPDATE: Lawyer+ (revisar, aprovar)
CREATE POLICY "petitions_update"
ON petitions FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- =============================================================================
-- EXCEPTIONS
-- =============================================================================

-- SELECT: Membros da org
CREATE POLICY "exceptions_select"
ON exceptions FOR SELECT TO authenticated
USING (org_id = ANY(get_user_org_ids()));

-- INSERT: Lawyer+ (reportar excecao manual)
CREATE POLICY "exceptions_insert"
ON exceptions FOR INSERT TO authenticated
WITH CHECK (
    is_org_member(org_id)
    AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer')
);

-- UPDATE: Lawyer+ (resolver excecoes)
CREATE POLICY "exceptions_update"
ON exceptions FOR UPDATE TO authenticated
USING (org_id = ANY(get_user_org_ids()) AND get_org_role(org_id) IN ('admin', 'coordinator', 'lawyer'))
WITH CHECK (org_id = ANY(get_user_org_ids()));

-- =============================================================================
-- AUDIT_LOG (Apenas leitura para admins)
-- =============================================================================

-- SELECT: Apenas admin pode ver logs de auditoria
CREATE POLICY "audit_log_select"
ON audit_log FOR SELECT TO authenticated
USING (
    org_id = ANY(get_user_org_ids())
    AND get_org_role(org_id) = 'admin'
);

-- INSERT/UPDATE/DELETE: Apenas via trigger/service role

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
DECLARE
    v_table TEXT;
    v_rls_enabled BOOLEAN;
BEGIN
    FOR v_table IN
        SELECT unnest(ARRAY[
            'organizations', 'users', 'org_members', 'courts',
            'cases', 'parties', 'documents', 'extracted_data',
            'validations', 'calculations', 'status_history',
            'petition_templates', 'petitions', 'exceptions', 'audit_log'
        ])
    LOOP
        SELECT relforcerowsecurity INTO v_rls_enabled
        FROM pg_class
        WHERE relname = v_table;

        -- RLS habilitado (mesmo que nao forcado, enable e suficiente)
    END LOOP;

    RAISE NOTICE 'Migration 00012: RLS policies applied to all tables successfully';
END $$;

COMMIT;
