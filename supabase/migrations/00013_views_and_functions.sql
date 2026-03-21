-- Migration: 00013_views_and_functions
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Views, RPCs e funcoes de negocio
--
-- Depends on: TODAS as migrations anteriores

BEGIN;

-- =============================================================================
-- VIEW: Dashboard resumo por organizacao
-- =============================================================================

CREATE OR REPLACE VIEW v_org_dashboard AS
SELECT
    c.org_id,
    COUNT(*) AS total_cases,
    COUNT(*) FILTER (WHERE c.status = 'received') AS received_count,
    COUNT(*) FILTER (WHERE c.status = 'analyzing') AS analyzing_count,
    COUNT(*) FILTER (WHERE c.status IN ('extraction_complete', 'validation_pending', 'validated')) AS processing_count,
    COUNT(*) FILTER (WHERE c.status IN ('calculation_pending', 'calculated')) AS calculation_count,
    COUNT(*) FILTER (WHERE c.status IN ('petition_generating', 'petition_generated')) AS petition_count,
    COUNT(*) FILTER (WHERE c.status = 'reviewed') AS reviewed_count,
    COUNT(*) FILTER (WHERE c.status = 'filed') AS filed_count,
    COUNT(*) FILTER (WHERE c.status = 'exception') AS exception_count,
    COALESCE(SUM(c.total_amount), 0) AS total_amount,
    COALESCE(SUM(c.total_amount) FILTER (WHERE c.status = 'filed'), 0) AS filed_amount,
    COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '7 days') AS cases_last_7_days,
    COUNT(*) FILTER (WHERE c.created_at >= NOW() - INTERVAL '30 days') AS cases_last_30_days
FROM cases c
WHERE c.deleted_at IS NULL
GROUP BY c.org_id;

COMMENT ON VIEW v_org_dashboard IS 'Dashboard resumo com contadores de status e valores por organizacao';

-- =============================================================================
-- VIEW: Caso com detalhes (join principal)
-- =============================================================================

CREATE OR REPLACE VIEW v_case_details AS
SELECT
    c.*,
    o.name AS org_name,
    ct.name AS court_name,
    ct.tribunal_acronym,
    ct.comarca AS court_comarca,
    ct.filing_system AS court_filing_system,
    lawyer.full_name AS lawyer_name,
    lawyer.oab_number AS lawyer_oab,
    intern.full_name AS intern_name,
    creator.full_name AS creator_name,
    -- Contagem de partes
    (SELECT COUNT(*) FROM parties p WHERE p.case_id = c.id) AS party_count,
    -- Contagem de documentos
    (SELECT COUNT(*) FROM documents d WHERE d.case_id = c.id AND d.deleted_at IS NULL) AS document_count,
    -- Excecoes abertas
    (SELECT COUNT(*) FROM exceptions e WHERE e.case_id = c.id AND e.status = 'open') AS open_exceptions,
    -- Excecoes blocking
    (SELECT COUNT(*) FROM exceptions e WHERE e.case_id = c.id AND e.status = 'open' AND e.blocks_pipeline = true) AS blocking_exceptions,
    -- Ultima peticao
    (SELECT p.status FROM petitions p WHERE p.case_id = c.id ORDER BY p.created_at DESC LIMIT 1) AS latest_petition_status,
    -- Devedor principal
    (SELECT p.full_name FROM parties p WHERE p.case_id = c.id AND p.role = 'debtor' AND p.is_primary = true LIMIT 1) AS primary_debtor_name
FROM cases c
LEFT JOIN organizations o ON o.id = c.org_id
LEFT JOIN courts ct ON ct.id = c.court_id
LEFT JOIN users lawyer ON lawyer.id = c.assigned_lawyer_id
LEFT JOIN users intern ON intern.id = c.assigned_intern_id
LEFT JOIN users creator ON creator.id = c.created_by
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW v_case_details IS 'View enriquecida de casos com joins de organizacao, foro, responsaveis e contadores';

-- =============================================================================
-- VIEW: Pipeline status (para kanban board)
-- =============================================================================

CREATE OR REPLACE VIEW v_pipeline_board AS
SELECT
    c.id,
    c.org_id,
    c.internal_reference,
    c.title,
    c.case_type,
    c.status,
    c.priority,
    c.total_amount,
    c.due_date,
    c.assigned_lawyer_id,
    lawyer.full_name AS lawyer_name,
    (SELECT p.full_name FROM parties p WHERE p.case_id = c.id AND p.role = 'debtor' AND p.is_primary = true LIMIT 1) AS debtor_name,
    (SELECT COUNT(*) FROM exceptions e WHERE e.case_id = c.id AND e.status = 'open') AS open_exceptions,
    c.received_at,
    c.updated_at,
    -- Tempo no status atual (em horas)
    EXTRACT(EPOCH FROM (NOW() - COALESCE(
        (SELECT sh.changed_at FROM status_history sh WHERE sh.case_id = c.id ORDER BY sh.changed_at DESC LIMIT 1),
        c.created_at
    ))) / 3600 AS hours_in_current_status
FROM cases c
LEFT JOIN users lawyer ON lawyer.id = c.assigned_lawyer_id
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW v_pipeline_board IS 'View otimizada para visualizacao kanban do pipeline de casos';

-- =============================================================================
-- RPC: Buscar casos com filtros
-- =============================================================================

CREATE OR REPLACE FUNCTION search_cases(
    p_org_id UUID,
    p_search TEXT DEFAULT NULL,
    p_status case_status DEFAULT NULL,
    p_case_type case_type DEFAULT NULL,
    p_assigned_to UUID DEFAULT NULL,
    p_date_from DATE DEFAULT NULL,
    p_date_to DATE DEFAULT NULL,
    p_page INTEGER DEFAULT 1,
    p_page_size INTEGER DEFAULT 25
)
RETURNS TABLE (
    id UUID,
    internal_reference VARCHAR,
    title TEXT,
    case_type case_type,
    status case_status,
    priority INTEGER,
    total_amount DECIMAL,
    debtor_name TEXT,
    lawyer_name TEXT,
    court_name TEXT,
    open_exceptions BIGINT,
    created_at TIMESTAMPTZ,
    total_count BIGINT
)
LANGUAGE plpgsql SECURITY INVOKER STABLE
AS $$
BEGIN
    RETURN QUERY
    WITH filtered AS (
        SELECT
            c.id,
            c.internal_reference,
            c.title,
            c.case_type,
            c.status,
            c.priority,
            c.total_amount,
            (SELECT p.full_name FROM parties p WHERE p.case_id = c.id AND p.role = 'debtor' AND p.is_primary = true LIMIT 1) AS debtor_name,
            u.full_name AS lawyer_name,
            ct.name AS court_name,
            (SELECT COUNT(*) FROM exceptions e WHERE e.case_id = c.id AND e.status = 'open') AS open_exceptions,
            c.created_at,
            COUNT(*) OVER() AS total_count
        FROM cases c
        LEFT JOIN users u ON u.id = c.assigned_lawyer_id
        LEFT JOIN courts ct ON ct.id = c.court_id
        WHERE c.org_id = p_org_id
        AND c.deleted_at IS NULL
        AND (p_status IS NULL OR c.status = p_status)
        AND (p_case_type IS NULL OR c.case_type = p_case_type)
        AND (p_assigned_to IS NULL OR c.assigned_lawyer_id = p_assigned_to)
        AND (p_date_from IS NULL OR c.created_at >= p_date_from)
        AND (p_date_to IS NULL OR c.created_at <= p_date_to + INTERVAL '1 day')
        AND (p_search IS NULL OR (
            c.title ILIKE '%' || p_search || '%'
            OR c.internal_reference ILIKE '%' || p_search || '%'
            OR c.case_number ILIKE '%' || p_search || '%'
            OR EXISTS (
                SELECT 1 FROM parties p
                WHERE p.case_id = c.id
                AND (p.full_name ILIKE '%' || p_search || '%'
                     OR p.cpf LIKE '%' || p_search || '%'
                     OR p.cnpj LIKE '%' || p_search || '%')
            )
        ))
        ORDER BY c.priority ASC, c.created_at DESC
    )
    SELECT * FROM filtered
    LIMIT p_page_size
    OFFSET (p_page - 1) * p_page_size;
END;
$$;

COMMENT ON FUNCTION search_cases IS 'Busca paginada de casos com filtros por status, tipo, responsavel, data e texto';

-- =============================================================================
-- RPC: Estatisticas do pipeline por periodo
-- =============================================================================

CREATE OR REPLACE FUNCTION get_pipeline_stats(
    p_org_id UUID,
    p_date_from DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days')::DATE,
    p_date_to DATE DEFAULT CURRENT_DATE
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY INVOKER STABLE
AS $$
DECLARE
    v_result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'period', jsonb_build_object('from', p_date_from, 'to', p_date_to),
        'totals', (
            SELECT jsonb_build_object(
                'received', COUNT(*) FILTER (WHERE status = 'received'),
                'in_pipeline', COUNT(*) FILTER (WHERE status NOT IN ('received', 'filed', 'exception')),
                'filed', COUNT(*) FILTER (WHERE status = 'filed'),
                'exceptions', COUNT(*) FILTER (WHERE status = 'exception'),
                'total_value', COALESCE(SUM(total_amount), 0),
                'filed_value', COALESCE(SUM(total_amount) FILTER (WHERE status = 'filed'), 0),
                'avg_processing_days', ROUND(AVG(
                    EXTRACT(EPOCH FROM (COALESCE(filed_at, NOW()) - received_at)) / 86400
                )::NUMERIC, 1)
            )
            FROM cases
            WHERE org_id = p_org_id
            AND deleted_at IS NULL
            AND created_at BETWEEN p_date_from AND p_date_to + INTERVAL '1 day'
        ),
        'daily_inflow', (
            SELECT jsonb_agg(jsonb_build_object(
                'date', d::DATE,
                'count', COALESCE(cnt, 0)
            ) ORDER BY d)
            FROM generate_series(p_date_from::TIMESTAMPTZ, p_date_to::TIMESTAMPTZ, '1 day') AS d
            LEFT JOIN (
                SELECT DATE_TRUNC('day', created_at) AS day, COUNT(*) AS cnt
                FROM cases
                WHERE org_id = p_org_id AND deleted_at IS NULL
                AND created_at BETWEEN p_date_from AND p_date_to + INTERVAL '1 day'
                GROUP BY 1
            ) stats ON stats.day = d
        ),
        'exception_breakdown', (
            SELECT jsonb_agg(jsonb_build_object(
                'type', exception_type,
                'count', cnt
            ) ORDER BY cnt DESC)
            FROM (
                SELECT exception_type, COUNT(*) AS cnt
                FROM exceptions
                WHERE org_id = p_org_id
                AND created_at BETWEEN p_date_from AND p_date_to + INTERVAL '1 day'
                GROUP BY exception_type
            ) sub
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION get_pipeline_stats IS 'Estatisticas do pipeline por periodo: totais, fluxo diario, excecoes';

-- =============================================================================
-- RPC: Mover caso no pipeline (com validacoes)
-- =============================================================================

CREATE OR REPLACE FUNCTION advance_case_status(
    p_case_id UUID,
    p_new_status case_status,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql SECURITY INVOKER VOLATILE
AS $$
DECLARE
    v_case RECORD;
    v_valid_transitions JSONB;
    v_result JSONB;
BEGIN
    -- Buscar caso
    SELECT * INTO v_case FROM cases WHERE id = p_case_id;

    IF v_case IS NULL THEN
        RAISE EXCEPTION 'Caso nao encontrado: %', p_case_id;
    END IF;

    -- Mapa de transicoes validas
    v_valid_transitions = '{
        "received": ["analyzing", "exception"],
        "analyzing": ["extraction_complete", "exception"],
        "extraction_complete": ["validation_pending", "exception"],
        "validation_pending": ["validated", "exception"],
        "validated": ["calculation_pending", "exception"],
        "calculation_pending": ["calculated", "exception"],
        "calculated": ["petition_generating", "exception"],
        "petition_generating": ["petition_generated", "exception"],
        "petition_generated": ["reviewed", "exception"],
        "reviewed": ["filed", "exception"],
        "exception": ["received", "analyzing"]
    }'::JSONB;

    -- Validar transicao
    IF NOT (v_valid_transitions->v_case.status::text) ? p_new_status::text THEN
        RAISE EXCEPTION 'Transicao invalida: % -> %', v_case.status, p_new_status;
    END IF;

    -- Verificar excecoes blocking antes de avancar (exceto para status exception)
    IF p_new_status != 'exception' THEN
        IF EXISTS (
            SELECT 1 FROM exceptions
            WHERE case_id = p_case_id
            AND status = 'open'
            AND blocks_pipeline = true
        ) THEN
            RAISE EXCEPTION 'Existem excecoes blocking abertas para este caso';
        END IF;
    END IF;

    -- Atualizar status
    UPDATE cases
    SET status = p_new_status
    WHERE id = p_case_id;

    -- Retornar resultado
    v_result = jsonb_build_object(
        'success', true,
        'case_id', p_case_id,
        'previous_status', v_case.status,
        'new_status', p_new_status,
        'changed_at', NOW()
    );

    RETURN v_result;
END;
$$;

COMMENT ON FUNCTION advance_case_status IS 'Avanca caso no pipeline com validacao de transicao e excecoes blocking';

-- =============================================================================
-- SUPABASE STORAGE POLICIES (Documentos e peticoes)
-- =============================================================================

-- Nota: Policies de Storage sao configuradas via Dashboard do Supabase
-- ou via SQL usando a tabela storage.policies.
-- Aqui documentamos a estrategia:

-- Bucket: case-documents
-- - SELECT: Membro da org do caso
-- - INSERT: Membro da org do caso
-- - UPDATE: Membro da org do caso
-- - DELETE: Admin da org do caso
-- - Path pattern: {org_id}/{case_id}/{filename}

-- Bucket: petitions
-- - SELECT: Membro da org do caso
-- - INSERT: Lawyer+ da org
-- - UPDATE: Lawyer+ da org
-- - DELETE: Admin da org
-- - Path pattern: {org_id}/{case_id}/petition-v{version}.pdf

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 00013: Views, RPCs and business functions created successfully';
END $$;

COMMIT;
