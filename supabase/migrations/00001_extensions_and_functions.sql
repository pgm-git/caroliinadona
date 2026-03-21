-- Migration: 00001_extensions_and_functions
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
-- Description: Extensoes, tipos ENUM e funcoes utilitarias base
--
-- IMPORTANT: Esta migration deve ser aplicada PRIMEIRO - todas as outras dependem dela

BEGIN;

-- =============================================================================
-- EXTENSOES
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation (fallback)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";        -- Criptografia
CREATE EXTENSION IF NOT EXISTS "pg_trgm";         -- Busca por similaridade (trigrams)
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- Remover acentos em buscas

-- =============================================================================
-- TIPOS ENUM
-- =============================================================================

-- Status do caso/processo no pipeline
CREATE TYPE case_status AS ENUM (
    'received',              -- Recebido, aguardando analise
    'analyzing',             -- Em analise pela IA
    'extraction_complete',   -- Extracao de dados concluida
    'validation_pending',    -- Aguardando validacao
    'validated',             -- Dados validados
    'calculation_pending',   -- Aguardando calculo
    'calculated',            -- Calculo de divida concluido
    'petition_generating',   -- Gerando peticao
    'petition_generated',    -- Peticao gerada
    'reviewed',              -- Revisado pelo advogado
    'filed',                 -- Protocolado no tribunal
    'exception'              -- Excecao/problema encontrado
);

-- Tipo do caso
CREATE TYPE case_type AS ENUM (
    'execution',   -- Execucao de titulo extrajudicial
    'collection'   -- Cobranca
);

-- Tipo de documento
CREATE TYPE document_type AS ENUM (
    'credit_certificate',     -- Cedula de credito bancario (CCB)
    'contract',               -- Contrato
    'guarantee',              -- Garantia (hipoteca, alienacao fiduciaria)
    'promissory_note',        -- Nota promissoria
    'check',                  -- Cheque
    'duplicate',              -- Duplicata
    'debenture',              -- Debenture
    'bank_statement',         -- Extrato bancario
    'notification',           -- Notificacao extrajudicial
    'power_of_attorney',      -- Procuracao
    'amendment',              -- Aditivo contratual
    'collateral_document',    -- Documento de garantia acessoria
    'other'                   -- Outros
);

-- Papel da parte no processo
CREATE TYPE party_role AS ENUM (
    'debtor',       -- Devedor
    'guarantor',    -- Avalista/Fiador
    'creditor',     -- Credor
    'co_debtor',    -- Co-devedor
    'surety',       -- Fiador solidario
    'assignee',     -- Cessionario
    'assignor'      -- Cedente
);

-- Tipo de pessoa
CREATE TYPE person_type AS ENUM (
    'individual',   -- Pessoa fisica
    'company'       -- Pessoa juridica
);

-- Tipo de excecao
CREATE TYPE exception_type AS ENUM (
    'missing_signature',       -- Assinatura ausente
    'incomplete_data',         -- Dados incompletos
    'atypical_action',         -- Acao atipica (nao segue padrao)
    'invalid_document',        -- Documento invalido
    'expired_statute',         -- Prescricao
    'insufficient_guarantee',  -- Garantia insuficiente
    'duplicate_case',          -- Caso duplicado
    'jurisdiction_conflict',   -- Conflito de competencia
    'calculation_error',       -- Erro de calculo
    'missing_document',        -- Documento faltante
    'data_inconsistency',      -- Inconsistencia de dados
    'other'                    -- Outros
);

-- Severidade da excecao
CREATE TYPE exception_severity AS ENUM (
    'low',       -- Informativa
    'medium',    -- Requer atencao
    'high',      -- Bloqueia progresso
    'critical'   -- Acao imediata necessaria
);

-- Status da excecao
CREATE TYPE exception_status AS ENUM (
    'open',       -- Aberta
    'in_review',  -- Em revisao
    'resolved',   -- Resolvida
    'dismissed'   -- Descartada
);

-- Role do usuario no sistema
CREATE TYPE user_role AS ENUM (
    'admin',        -- Administrador do escritorio
    'coordinator',  -- Coordenador de equipe
    'lawyer',       -- Advogado
    'intern'        -- Estagiario
);

-- Status da validacao
CREATE TYPE validation_status AS ENUM (
    'pending',   -- Pendente
    'passed',    -- Aprovada
    'failed',    -- Reprovada
    'warning'    -- Aprovada com ressalvas
);

-- Tipo do indice de correcao
CREATE TYPE correction_index AS ENUM (
    'igpm',        -- IGP-M (FGV)
    'ipca',        -- IPCA (IBGE)
    'inpc',        -- INPC (IBGE)
    'selic',       -- Taxa SELIC
    'cdi',         -- CDI
    'tr',          -- TR (Taxa Referencial)
    'tjlp',        -- TJLP
    'custom'       -- Indice customizado
);

-- Status da peticao
CREATE TYPE petition_status AS ENUM (
    'draft',       -- Rascunho
    'generated',   -- Gerada pela IA
    'reviewing',   -- Em revisao
    'approved',    -- Aprovada
    'filed',       -- Protocolada
    'rejected'     -- Rejeitada (precisa retrabalho)
);

-- Tipo de acao na auditoria
CREATE TYPE audit_action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'STATUS_CHANGE',
    'LOGIN',
    'EXPORT',
    'DOCUMENT_UPLOAD',
    'DOCUMENT_DOWNLOAD',
    'PETITION_GENERATE',
    'PETITION_FILE'
);

-- =============================================================================
-- FUNCOES UTILITARIAS
-- =============================================================================

-- Funcao para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funcao para buscar tenant_ids do usuario autenticado
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS UUID[] AS $$
BEGIN
    RETURN ARRAY(
        SELECT org_id
        FROM org_members
        WHERE user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcao para verificar se usuario e membro de uma organizacao
CREATE OR REPLACE FUNCTION is_org_member(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM org_members
        WHERE org_id = check_org_id
        AND user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcao para obter role do usuario na organizacao
CREATE OR REPLACE FUNCTION get_org_role(check_org_id UUID)
RETURNS user_role AS $$
BEGIN
    RETURN (
        SELECT role
        FROM org_members
        WHERE org_id = check_org_id
        AND user_id = auth.uid()
        AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcao para verificar se usuario e admin ou coordinator
CREATE OR REPLACE FUNCTION is_org_admin_or_coordinator(check_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM org_members
        WHERE org_id = check_org_id
        AND user_id = auth.uid()
        AND is_active = true
        AND role IN ('admin', 'coordinator')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Funcao para busca full-text com unaccent
CREATE OR REPLACE FUNCTION immutable_unaccent(text)
RETURNS text AS $$
    SELECT unaccent($1);
$$ LANGUAGE sql IMMUTABLE;

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Migration 00001: Extensions, enums and utility functions created successfully';
END $$;

COMMIT;
