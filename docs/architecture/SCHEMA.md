# Modelo de Dados - Carolina Legal MicroSaaS

## Visao Geral

Sistema de automacao de execucoes e cobrancas bancarias multi-tenant, projetado para Supabase (PostgreSQL).

**Autor:** Dara (@data-engineer)
**Data:** 2026-03-21
**Versao:** 1.0.0

---

## Diagrama ER (Mermaid)

```mermaid
erDiagram
    organizations ||--o{ org_members : "has members"
    organizations ||--o{ cases : "owns"
    organizations ||--o{ documents : "owns"
    organizations ||--o{ parties : "owns"
    organizations ||--o{ extracted_data : "owns"
    organizations ||--o{ validations : "owns"
    organizations ||--o{ calculations : "owns"
    organizations ||--o{ petitions : "owns"
    organizations ||--o{ exceptions : "owns"
    organizations ||--o{ status_history : "owns"
    organizations ||--o{ audit_log : "owns"
    organizations ||--o{ petition_templates : "custom templates"

    users ||--o{ org_members : "belongs to"
    users ||--o{ cases : "assigned lawyer"
    users ||--o{ cases : "assigned intern"
    users ||--o{ cases : "created by"

    cases ||--o{ parties : "has parties"
    cases ||--o{ documents : "has documents"
    cases ||--o{ extracted_data : "has extractions"
    cases ||--o{ validations : "has validations"
    cases ||--o{ calculations : "has calculations"
    cases ||--o{ petitions : "has petitions"
    cases ||--o{ exceptions : "has exceptions"
    cases ||--o{ status_history : "has history"
    cases }o--|| courts : "filed at"

    documents ||--o{ extracted_data : "data from"
    petitions }o--|| petition_templates : "based on"
    petitions }o--|| calculations : "uses calculation"
    petitions }o--|| courts : "filed at"
    exceptions }o--o| documents : "related to"
    exceptions }o--o| validations : "from validation"

    organizations {
        uuid id PK
        text name
        text slug UK
        varchar cnpj UK
        text plan
        boolean is_active
        jsonb settings
        timestamptz created_at
        timestamptz deleted_at
    }

    users {
        uuid id PK_FK
        text full_name
        text email
        varchar oab_number
        varchar oab_state
        jsonb preferences
        timestamptz lgpd_consent_at
        boolean is_active
    }

    org_members {
        uuid id PK
        uuid org_id FK
        uuid user_id FK
        user_role role
        jsonb permissions
        boolean is_active
    }

    courts {
        uuid id PK
        text name
        text comarca
        text vara
        varchar tribunal_acronym
        text justice_type
        varchar state
        boolean electronic_filing
        text filing_system
    }

    cases {
        uuid id PK
        uuid org_id FK
        varchar case_number
        varchar internal_reference UK
        text title
        case_type case_type
        case_status status
        integer priority
        uuid court_id FK
        decimal principal_amount
        decimal total_amount
        correction_index correction_index
        decimal interest_rate
        uuid assigned_lawyer_id FK
        uuid assigned_intern_id FK
        jsonb metadata
        timestamptz deleted_at
    }

    parties {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        party_role role
        person_type person_type
        boolean is_primary
        text full_name
        varchar cpf
        varchar cnpj
        text email
        text address_street
        jsonb metadata
    }

    documents {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        document_type document_type
        text title
        text storage_path UK
        text original_filename
        varchar mime_type
        bigint file_size_bytes
        boolean is_processed
        text ocr_text
        decimal ai_confidence
        timestamptz deleted_at
    }

    extracted_data {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        uuid document_id FK
        text extraction_model
        decimal confidence_score
        jsonb extracted_fields
        boolean is_approved
    }

    validations {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        uuid extracted_data_id FK
        varchar rule_code
        text rule_name
        validation_status status
        exception_severity severity
        text field_name
        text message
    }

    calculations {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        decimal principal_amount
        correction_index correction_index
        decimal total_amount
        jsonb monthly_breakdown
        boolean is_current
        integer version
        boolean is_validated
    }

    petition_templates {
        uuid id PK
        uuid org_id FK
        text name
        varchar template_code UK
        case_type case_type
        text template_body
        jsonb required_variables
        boolean is_system
        boolean is_active
    }

    petitions {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        uuid template_id FK
        uuid calculation_id FK
        text title
        text content_html
        petition_status status
        text generated_by
        uuid reviewed_by FK
        varchar filing_number
        uuid filing_court_id FK
    }

    exceptions {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        uuid document_id FK
        exception_type exception_type
        exception_severity severity
        exception_status status
        text title
        text description
        boolean blocks_pipeline
    }

    status_history {
        uuid id PK
        uuid org_id FK
        uuid case_id FK
        text previous_status
        text new_status
        uuid changed_by FK
        text reason
        timestamptz changed_at
    }

    audit_log {
        uuid id PK
        uuid org_id FK
        audit_action action
        text table_name
        uuid record_id
        uuid user_id FK
        jsonb old_data
        jsonb new_data
        boolean contains_pii
        uuid data_subject_id
        timestamptz created_at
    }
```

---

## Cardinalidades

| Relacionamento | Cardinalidade | Descricao |
|---|---|---|
| Organization -> OrgMembers | 1:N | Uma org tem muitos membros |
| User -> OrgMembers | 1:N | Um usuario pode pertencer a varias orgs |
| Organization -> Cases | 1:N | Uma org tem muitos casos |
| Case -> Parties | 1:N | Um caso tem varias partes |
| Case -> Documents | 1:N | Um caso tem varios documentos |
| Case -> ExtractedData | 1:N | Um caso tem varias extracoes |
| Document -> ExtractedData | 1:N | Um documento pode ter varias extracoes |
| Case -> Validations | 1:N | Um caso tem varias validacoes |
| Case -> Calculations | 1:N | Um caso tem varios calculos (versionados) |
| Case -> Petitions | 1:N | Um caso tem varias peticoes (versoes) |
| Case -> Exceptions | 1:N | Um caso pode ter varias excecoes |
| Case -> StatusHistory | 1:N | Um caso tem historico de status |
| Case -> Court | N:1 | Muitos casos no mesmo foro |
| Petition -> PetitionTemplate | N:1 | Muitas peticoes do mesmo template |
| Petition -> Calculation | N:1 | Uma peticao usa um calculo |
| Organization -> AuditLog | 1:N | Uma org tem muitos logs |

---

## Pipeline de Status do Caso

```
received
  |
  v
analyzing
  |
  v
extraction_complete
  |
  v
validation_pending
  |
  v
validated
  |
  v
calculation_pending
  |
  v
calculated
  |
  v
petition_generating
  |
  v
petition_generated
  |
  v
reviewed
  |
  v
filed

[Qualquer status] --> exception (quando problema detectado)
exception --> received | analyzing (retorno ao pipeline)
```

---

## Estrategia Multi-Tenant

### Isolamento por `org_id`
- **Toda** tabela de dados do cliente possui `org_id` como coluna NOT NULL
- RLS policies garantem que usuarios so acessam dados de suas organizacoes
- Funcoes helper: `get_user_org_ids()`, `is_org_member()`, `get_org_role()`

### Niveis de acesso por role

| Role | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| admin | Tudo da org | Tudo | Tudo | Tudo (soft delete) |
| coordinator | Tudo da org | Tudo | Tudo | Parties, Documents |
| lawyer | Tudo da org | Cases, Parties, Docs, Petitions | Cases, Parties, Docs, Petitions | - |
| intern | Tudo da org | Documents (upload) | - | - |

### Tabelas compartilhadas (sem org_id no RLS)
- `courts` - Dados publicos de foros/comarcas
- `petition_templates` (com `is_system = true`) - Templates globais

---

## Estrategia de Storage (Supabase Storage)

### Buckets

| Bucket | Conteudo | Politica de retencao |
|---|---|---|
| `case-documents` | CCBs, contratos, garantias (PDF, imagens) | 10 anos (obrigacao legal) |
| `petitions` | Peticoes geradas (PDF) | 10 anos |

### Padrao de path

```
case-documents/
  {org_id}/
    {case_id}/
      original-filename.pdf
      original-filename-v2.pdf

petitions/
  {org_id}/
    {case_id}/
      petition-v1.pdf
      petition-v2.pdf
      filing-receipt.pdf
```

### Politicas de acesso (Storage RLS)
- **SELECT:** Membro da org do caso
- **INSERT:** Membro da org (qualquer role)
- **DELETE:** Admin da org apenas

### Limites por plano

| Plano | Storage | Tamanho max por arquivo |
|---|---|---|
| Starter | 10 GB | 50 MB |
| Professional | 50 GB | 100 MB |
| Enterprise | 500 GB | 250 MB |

---

## LGPD Compliance

### Funcoes implementadas
- `lgpd_anonymize_subject(subject_id, org_id)` - Anonimiza dados de um titular
- `lgpd_export_subject_data(cpf, org_id)` - Exporta dados para portabilidade

### Campos PII nas tabelas

| Tabela | Campos PII |
|---|---|
| `parties` | full_name, cpf, rg, email, phone, birth_date, address_* |
| `users` | full_name, email, phone, oab_number |
| `audit_log` | old_data, new_data (quando contem PII), user_email |

### Retencao
- `audit_log.retention_until` - Data maxima de retencao por registro
- `audit_log.contains_pii` - Flag para identificar logs com dados pessoais
- `audit_log.data_subject_id` - Vinculo ao titular para direito de acesso

---

## Ordem de Criacao das Migrations

| # | Migration | Dependencias |
|---|---|---|
| 00001 | Extensions, enums, funcoes utilitarias | Nenhuma |
| 00002 | Organizations, users, org_members | 00001 |
| 00003 | Courts | 00001 |
| 00004 | Cases | 00002, 00003 |
| 00005 | Parties | 00004 |
| 00006 | Documents | 00004 |
| 00007 | Extracted_data, validations | 00004, 00006 |
| 00008 | Calculations, status_history | 00004 |
| 00009 | Petition_templates, petitions | 00004, 00003 |
| 00010 | Exceptions | 00004, 00006 |
| 00011 | Audit_log, LGPD functions | 00002+ (todas) |
| 00012 | RLS policies | Todas |
| 00013 | Views, RPCs, funcoes de negocio | Todas |

---

## Indices de Performance

### Queries mais frequentes e indices correspondentes

| Query | Indice |
|---|---|
| Listar casos por org + status | `idx_cases_org_status` |
| Buscar caso por referencia interna | `idx_cases_org_internal_ref` (UNIQUE) |
| Buscar caso por numero de processo | `idx_cases_org_case_number` |
| Filtrar por tipo + status | `idx_cases_org_type_status` |
| Casos por advogado | `idx_cases_assigned_lawyer` |
| Casos por prioridade | `idx_cases_org_priority` |
| Documentos nao processados | `idx_documents_unprocessed` |
| Busca full-text OCR | `idx_documents_ocr_fts` (GIN) |
| Partes por CPF/CNPJ | `idx_parties_org_cpf`, `idx_parties_org_cnpj` |
| Busca por nome (trigram) | `idx_parties_name_trgm`, `idx_cases_title_trgm` |
| Excecoes blocking abertas | `idx_exceptions_blocking` |
| Historico de status (timeline) | `idx_status_history_case_at` |
| Audit log por usuario | `idx_audit_log_user` |
| Audit log LGPD titular | `idx_audit_log_data_subject` |

### Indices especiais
- **Partial indexes:** Usados extensivamente para filtrar `WHERE deleted_at IS NULL`, `WHERE is_active = true`, etc.
- **GIN indexes:** Para busca full-text (`to_tsvector`) e JSONB (`extracted_fields`)
- **Trigram indexes:** Para busca por similaridade em nomes (`gin_trgm_ops`)

---

## Triggers Ativos

| Trigger | Tabela | Evento | Funcao |
|---|---|---|---|
| `trigger_*_updated_at` | Todas | BEFORE UPDATE | `update_updated_at_column()` |
| `trigger_cases_status_change` | cases | BEFORE UPDATE (status) | `cases_status_change_trigger()` |
| `trigger_calculations_deactivate_previous` | calculations | AFTER INSERT | `deactivate_previous_calculation()` |
| `trigger_exceptions_check_unblocked` | exceptions | AFTER UPDATE | `check_case_unblocked()` |
| `trigger_*_audit` | 7 tabelas | AFTER I/U/D | `audit_trigger_function()` |
