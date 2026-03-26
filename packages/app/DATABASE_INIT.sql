-- ============================================================================
-- CAROLINA DATABASE INITIALIZATION SQL
-- Para rodar no Supabase SQL Editor
-- ============================================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE case_status AS ENUM (
  'received',
  'analyzing',
  'extraction_complete',
  'validation_pending',
  'validated',
  'calculation_pending',
  'calculated',
  'petition_generating',
  'petition_generated',
  'reviewed',
  'filed',
  'exception'
);

CREATE TYPE case_type AS ENUM ('execution', 'collection');

CREATE TYPE document_type AS ENUM (
  'credit_certificate',
  'contract',
  'guarantee',
  'promissory_note',
  'check',
  'duplicate',
  'debenture',
  'bank_statement',
  'notification',
  'power_of_attorney',
  'amendment',
  'collateral_document',
  'other'
);

CREATE TYPE party_role AS ENUM (
  'debtor',
  'guarantor',
  'creditor',
  'co_debtor',
  'surety',
  'assignee',
  'assignor'
);

CREATE TYPE person_type AS ENUM ('individual', 'company');

CREATE TYPE exception_type AS ENUM (
  'missing_signature',
  'incomplete_data',
  'atypical_action',
  'invalid_document',
  'expired_statute',
  'insufficient_guarantee',
  'duplicate_case',
  'jurisdiction_conflict',
  'calculation_error',
  'missing_document',
  'data_inconsistency',
  'other'
);

CREATE TYPE exception_severity AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE exception_status AS ENUM (
  'open',
  'in_review',
  'resolved',
  'dismissed'
);

CREATE TYPE user_role AS ENUM ('admin', 'coordinator', 'lawyer', 'intern');

CREATE TYPE validation_status AS ENUM (
  'pending',
  'passed',
  'failed',
  'warning'
);

CREATE TYPE correction_index AS ENUM (
  'igpm',
  'ipca',
  'inpc',
  'selic',
  'cdi',
  'tr',
  'tjlp',
  'custom'
);

CREATE TYPE petition_status AS ENUM (
  'draft',
  'generated',
  'reviewing',
  'approved',
  'filed',
  'rejected'
);

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

CREATE TYPE notification_type AS ENUM (
  'status_change',
  'document_processed',
  'validation_complete',
  'calculation_complete',
  'petition_generated',
  'exception_raised',
  'system_info',
  'system_warning',
  'system_error'
);

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj VARCHAR(18) UNIQUE,
  oab_number VARCHAR(20),
  email TEXT,
  phone VARCHAR(20),
  website TEXT,
  address_street TEXT,
  address_number VARCHAR(20),
  address_complement VARCHAR(100),
  address_neighborhood VARCHAR(100),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  settings JSONB NOT NULL DEFAULT '{}',
  plan TEXT NOT NULL DEFAULT 'starter',
  max_users INTEGER NOT NULL DEFAULT 5,
  max_cases_per_month INTEGER NOT NULL DEFAULT 100,
  storage_limit_gb INTEGER NOT NULL DEFAULT 10,
  lgpd_dpo_name TEXT,
  lgpd_dpo_email TEXT,
  lgpd_privacy_policy_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_plan ON organizations(plan);

-- ============================================================================
-- USERS
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  oab_number VARCHAR(20),
  oab_state VARCHAR(2),
  preferences JSONB NOT NULL DEFAULT '{}',
  lgpd_consent_at TIMESTAMP WITH TIME ZONE,
  lgpd_consent_version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- ORG_MEMBERS
-- ============================================================================

CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX idx_org_members_org ON org_members(org_id);
CREATE INDEX idx_org_members_user ON org_members(user_id);

-- ============================================================================
-- COURTS
-- ============================================================================

CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  tribunal_acronym VARCHAR(50) NOT NULL,
  state VARCHAR(2) NOT NULL,
  comarca VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  region VARCHAR(50),
  phone VARCHAR(20),
  website TEXT,
  email TEXT,
  judicial_segment TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_courts_tribunal ON courts(tribunal_acronym);
CREATE INDEX idx_courts_state ON courts(state);
CREATE INDEX idx_courts_comarca ON courts(comarca);
CREATE INDEX idx_courts_state_comarca ON courts(state, comarca);

-- ============================================================================
-- CASES
-- ============================================================================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_number VARCHAR(50),
  internal_reference VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  case_type case_type NOT NULL,
  status case_status NOT NULL DEFAULT 'received',
  priority INTEGER NOT NULL DEFAULT 3,
  court_id UUID REFERENCES courts(id) ON DELETE SET NULL,
  jurisdiction_notes TEXT,
  principal_amount DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  inadimplence_date DATE,
  assigned_lawyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_intern_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_cases_org ON cases(org_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_case_type ON cases(case_type);
CREATE INDEX idx_cases_created_at ON cases(created_at);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type VARCHAR(50),
  file_size_bytes BIGINT,
  storage_path TEXT,
  mime_type VARCHAR(100),
  document_type document_type,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  extraction_status TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_org ON documents(org_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_is_processed ON documents(is_processed);

-- ============================================================================
-- PARTIES
-- ============================================================================

CREATE TABLE parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  document_number VARCHAR(20),
  person_type person_type NOT NULL,
  role party_role NOT NULL,
  email TEXT,
  phone VARCHAR(20),
  address_street TEXT,
  address_number VARCHAR(20),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parties_case ON parties(case_id);
CREATE INDEX idx_parties_document ON parties(document_number);
CREATE INDEX idx_parties_role ON parties(role);

-- ============================================================================
-- VALIDATIONS
-- ============================================================================

CREATE TABLE validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  validation_type TEXT NOT NULL,
  status validation_status NOT NULL DEFAULT 'pending',
  result BOOLEAN,
  message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_validations_case ON validations(case_id);
CREATE INDEX idx_validations_type ON validations(validation_type);

-- ============================================================================
-- CLASSIFICATIONS
-- ============================================================================

CREATE TABLE classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  classification_name TEXT NOT NULL,
  classification_score DECIMAL(3, 2),
  is_applicable BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_classifications_case ON classifications(case_id);
CREATE INDEX idx_classifications_name ON classifications(classification_name);

-- ============================================================================
-- CALCULATIONS
-- ============================================================================

CREATE TABLE calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  principal_amount DECIMAL(15, 2) NOT NULL,
  correction_index correction_index,
  correction_value DECIMAL(15, 2),
  corrected_amount DECIMAL(15, 2),
  interest_rate DECIMAL(5, 2),
  interest_value DECIMAL(15, 2),
  penalty_percent DECIMAL(5, 2),
  penalty_value DECIMAL(15, 2),
  attorney_percent DECIMAL(5, 2),
  attorney_value DECIMAL(15, 2),
  total_amount DECIMAL(15, 2),
  calculation_date DATE,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT false,
  monthly_breakdown JSONB,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calculations_case ON calculations(case_id);
CREATE INDEX idx_calculations_is_current ON calculations(case_id, is_current);
CREATE INDEX idx_calculations_version ON calculations(case_id, version);

-- ============================================================================
-- PETITION_TEMPLATES
-- ============================================================================

CREATE TABLE petition_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  template_code VARCHAR(50) NOT NULL,
  template_body TEXT NOT NULL,
  case_type case_type,
  required_variables TEXT[] DEFAULT '{}',
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_petition_templates_code ON petition_templates(template_code);
CREATE INDEX idx_petition_templates_case_type ON petition_templates(case_type);

-- ============================================================================
-- PETITIONS
-- ============================================================================

CREATE TABLE petitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  calculation_id UUID REFERENCES calculations(id) ON DELETE SET NULL,
  template_code VARCHAR(50),
  status petition_status NOT NULL DEFAULT 'draft',
  content_html TEXT,
  content_text TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT false,
  variables_used JSONB DEFAULT '{}',
  ai_model VARCHAR(50),
  generated_prompt_hash VARCHAR(255),
  storage_path TEXT,
  file_size_bytes BIGINT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_petitions_case ON petitions(case_id);
CREATE INDEX idx_petitions_status ON petitions(status);
CREATE INDEX idx_petitions_is_current ON petitions(case_id, is_current);
CREATE INDEX idx_petitions_version ON petitions(case_id, version);

-- ============================================================================
-- EXCEPTIONS
-- ============================================================================

CREATE TABLE exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  exception_type exception_type NOT NULL,
  severity exception_severity NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status exception_status NOT NULL DEFAULT 'open',
  affected_field TEXT,
  suggested_action TEXT,
  auto_resolvable BOOLEAN NOT NULL DEFAULT false,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  resolution_action TEXT,
  blocks_pipeline BOOLEAN NOT NULL DEFAULT true,
  pipeline_step TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exceptions_org ON exceptions(org_id);
CREATE INDEX idx_exceptions_case ON exceptions(case_id);
CREATE INDEX idx_exceptions_case_status ON exceptions(case_id, status);
CREATE INDEX idx_exceptions_type ON exceptions(org_id, exception_type);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  action_url TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_notifications_org ON notifications(org_id);
CREATE INDEX idx_notifications_case ON notifications(case_id);
CREATE INDEX idx_notifications_expires ON notifications(expires_at);

-- ============================================================================
-- AUDIT_LOG
-- ============================================================================

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_role TEXT,
  ip_address INET,
  user_agent TEXT,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  description TEXT,
  metadata JSONB DEFAULT '{}',
  contains_pii BOOLEAN NOT NULL DEFAULT false,
  data_subject_id UUID,
  legal_basis TEXT,
  retention_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_org ON audit_log(org_id);
CREATE INDEX idx_audit_log_action ON audit_log(action, created_at);
CREATE INDEX idx_audit_log_org_table ON audit_log(org_id, table_name, created_at);
CREATE INDEX idx_audit_log_org_timeline ON audit_log(org_id, created_at);

-- ============================================================================
-- DOCUMENT_REVIEWS (para OCR results)
-- ============================================================================

CREATE TABLE document_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  extracted_text TEXT,
  detected_parties JSONB,
  detected_dates JSONB,
  detected_amounts JSONB,
  ocr_confidence DECIMAL(3, 2),
  extracted_entities JSONB,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  is_approved BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_document_reviews_document ON document_reviews(document_id);
CREATE INDEX idx_document_reviews_case ON document_reviews(case_id);
CREATE INDEX idx_document_reviews_is_approved ON document_reviews(is_approved);

-- ============================================================================
-- FINAL: Enable RLS (Row Level Security)
-- ============================================================================

-- Habilitar RLS em tabelas sensíveis
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE petitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas (ajustar conforme sua autenticação)
-- Exemplo: Usuários só veem dados da sua organização
CREATE POLICY org_isolation ON organizations
  FOR ALL
  USING (id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));

-- ============================================================================
-- SEEDS (Dados iniciais opcionais)
-- ============================================================================

-- Criar organização de teste (descomente para usar)
-- INSERT INTO organizations (name, slug, plan)
-- VALUES ('Test Organization', 'test-org', 'starter');

-- ============================================================================
-- FIM
-- ============================================================================
