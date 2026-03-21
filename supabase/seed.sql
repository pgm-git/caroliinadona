-- Seed Data - Carolina Legal MicroSaaS
-- Purpose: Dados iniciais para desenvolvimento e testes
-- Created: 2026-03-21
-- Author: Dara (@data-engineer)
--
-- IMPORTANT: Idempotente - seguro para rodar multiplas vezes
-- NAO USAR em producao com dados reais

BEGIN;

-- =============================================================================
-- COURTS (Foros e Comarcas - dados de referencia)
-- =============================================================================

INSERT INTO courts (id, name, comarca, vara, tribunal_name, tribunal_acronym, justice_type, state, city, electronic_filing, filing_system, filing_url)
VALUES
    -- Sao Paulo
    ('c0000000-0000-0000-0000-000000000001', 'Foro Central Civel - 1a Vara Civel', 'Sao Paulo', '1a Vara Civel', 'Tribunal de Justica do Estado de Sao Paulo', 'TJSP', 'estadual', 'SP', 'Sao Paulo', true, 'eSAJ', 'https://esaj.tjsp.jus.br'),
    ('c0000000-0000-0000-0000-000000000002', 'Foro Central Civel - 2a Vara Civel', 'Sao Paulo', '2a Vara Civel', 'Tribunal de Justica do Estado de Sao Paulo', 'TJSP', 'estadual', 'SP', 'Sao Paulo', true, 'eSAJ', 'https://esaj.tjsp.jus.br'),
    ('c0000000-0000-0000-0000-000000000003', 'Foro Regional de Santo Amaro', 'Santo Amaro', NULL, 'Tribunal de Justica do Estado de Sao Paulo', 'TJSP', 'estadual', 'SP', 'Sao Paulo', true, 'eSAJ', 'https://esaj.tjsp.jus.br'),
    ('c0000000-0000-0000-0000-000000000004', 'Foro de Campinas', 'Campinas', NULL, 'Tribunal de Justica do Estado de Sao Paulo', 'TJSP', 'estadual', 'SP', 'Campinas', true, 'eSAJ', 'https://esaj.tjsp.jus.br'),
    -- Rio de Janeiro
    ('c0000000-0000-0000-0000-000000000005', 'Foro Central - 1a Vara Civel', 'Rio de Janeiro', '1a Vara Civel', 'Tribunal de Justica do Estado do Rio de Janeiro', 'TJRJ', 'estadual', 'RJ', 'Rio de Janeiro', true, 'PJe', 'https://pje.tjrj.jus.br'),
    ('c0000000-0000-0000-0000-000000000006', 'Foro Regional de Jacarepagua', 'Jacarepagua', NULL, 'Tribunal de Justica do Estado do Rio de Janeiro', 'TJRJ', 'estadual', 'RJ', 'Rio de Janeiro', true, 'PJe', 'https://pje.tjrj.jus.br'),
    -- Minas Gerais
    ('c0000000-0000-0000-0000-000000000007', 'Foro da Comarca de Belo Horizonte', 'Belo Horizonte', NULL, 'Tribunal de Justica do Estado de Minas Gerais', 'TJMG', 'estadual', 'MG', 'Belo Horizonte', true, 'PJe', 'https://pje.tjmg.jus.br'),
    -- Federal
    ('c0000000-0000-0000-0000-000000000008', 'Justica Federal - Sao Paulo', 'Sao Paulo', '1a Vara Federal', 'Tribunal Regional Federal da 3a Regiao', 'TRF3', 'federal', 'SP', 'Sao Paulo', true, 'PJe', 'https://pje1g.trf3.jus.br')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    filing_system = EXCLUDED.filing_system,
    filing_url = EXCLUDED.filing_url,
    updated_at = NOW();

-- =============================================================================
-- PETITION TEMPLATES (Templates do sistema)
-- =============================================================================

INSERT INTO petition_templates (id, org_id, name, description, template_code, case_type, applicable_document_types, template_body, template_format, required_variables, is_active, is_system)
VALUES
    (
        'pt000000-0000-0000-0000-000000000001',
        NULL, -- Template global do sistema
        'Execucao de Titulo Extrajudicial - CCB',
        'Peticao inicial de execucao de titulo extrajudicial baseada em Cedula de Credito Bancario',
        'EXEC-CCB',
        'execution',
        '{credit_certificate}',
        '<h1>EXCELENTISSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA {{court_vara}} DA COMARCA DE {{court_comarca}} - {{court_state}}</h1>

<p><strong>{{creditor_name}}</strong>, pessoa juridica de direito privado, inscrita no CNPJ sob o n. {{creditor_cnpj}}, com sede na {{creditor_address}}, vem, respeitosamente, por seus advogados signatarios, com fundamento nos artigos 784, XII, e 786 do Codigo de Processo Civil, propor a presente</p>

<h2>ACAO DE EXECUCAO DE TITULO EXTRAJUDICIAL</h2>

<p>em face de <strong>{{debtor_name}}</strong>, {{debtor_qualification}}, portador(a) do CPF n. {{debtor_cpf}}, residente e domiciliado(a) na {{debtor_address}}, pelos fatos e fundamentos a seguir expostos.</p>

<h3>I - DOS FATOS</h3>
<p>{{facts_section}}</p>

<h3>II - DO TITULO EXECUTIVO</h3>
<p>O(A) executado(a) firmou a Cedula de Credito Bancario n. {{contract_number}}, datada de {{contract_date}}, no valor de R$ {{principal_amount}}, com vencimento em {{due_date}}.</p>

<h3>III - DA DIVIDA</h3>
<p>A divida atualizada ate {{calculation_date}} perfaz o montante de <strong>R$ {{total_amount}}</strong>, conforme planilha de calculo anexa, composta de:</p>
<ul>
<li>Principal corrigido: R$ {{corrected_amount}}</li>
<li>Juros de mora: R$ {{interest_amount}}</li>
<li>Multa contratual: R$ {{penalty_amount}}</li>
<li>Honorarios advocaticios contratuais: R$ {{attorney_fees_amount}}</li>
</ul>

<h3>IV - DOS PEDIDOS</h3>
<p>Ante o exposto, requer:</p>
<ol>
<li>A citacao do(a) executado(a) para pagar a quantia de R$ {{total_amount}}, no prazo de 3 (tres) dias, sob pena de penhora;</li>
<li>A condenacao do(a) executado(a) ao pagamento das custas processuais e honorarios advocaticios;</li>
<li>A intimacao do(a) executado(a) da penhora realizada.</li>
</ol>

<p>Da-se a causa o valor de R$ {{total_amount}}.</p>

<p>Termos em que,<br>Pede deferimento.</p>

<p>{{city}}, {{current_date}}.</p>

<p>{{lawyer_name}}<br>OAB/{{lawyer_oab_state}} {{lawyer_oab_number}}</p>',
        'html',
        '[
            {"name": "court_vara", "type": "string", "required": true},
            {"name": "court_comarca", "type": "string", "required": true},
            {"name": "court_state", "type": "string", "required": true},
            {"name": "creditor_name", "type": "string", "required": true},
            {"name": "creditor_cnpj", "type": "string", "required": true},
            {"name": "creditor_address", "type": "string", "required": true},
            {"name": "debtor_name", "type": "string", "required": true},
            {"name": "debtor_qualification", "type": "string", "required": true},
            {"name": "debtor_cpf", "type": "string", "required": true},
            {"name": "debtor_address", "type": "string", "required": true},
            {"name": "contract_number", "type": "string", "required": true},
            {"name": "contract_date", "type": "date", "required": true},
            {"name": "principal_amount", "type": "currency", "required": true},
            {"name": "due_date", "type": "date", "required": true},
            {"name": "total_amount", "type": "currency", "required": true},
            {"name": "corrected_amount", "type": "currency", "required": true},
            {"name": "interest_amount", "type": "currency", "required": true},
            {"name": "penalty_amount", "type": "currency", "required": true},
            {"name": "attorney_fees_amount", "type": "currency", "required": true},
            {"name": "calculation_date", "type": "date", "required": true},
            {"name": "facts_section", "type": "text", "required": true},
            {"name": "city", "type": "string", "required": true},
            {"name": "current_date", "type": "date", "required": true},
            {"name": "lawyer_name", "type": "string", "required": true},
            {"name": "lawyer_oab_state", "type": "string", "required": true},
            {"name": "lawyer_oab_number", "type": "string", "required": true}
        ]'::JSONB,
        true,
        true
    ),
    (
        'pt000000-0000-0000-0000-000000000002',
        NULL,
        'Acao de Cobranca - Contrato',
        'Peticao inicial de acao de cobranca baseada em contrato',
        'COB-CONTRATO',
        'collection',
        '{contract}',
        '<h1>PETICAO INICIAL - ACAO DE COBRANCA</h1><p>Template base para cobranca contratual. Customize conforme necessidade.</p>',
        'html',
        '[
            {"name": "debtor_name", "type": "string", "required": true},
            {"name": "total_amount", "type": "currency", "required": true},
            {"name": "contract_number", "type": "string", "required": true}
        ]'::JSONB,
        true,
        true
    ),
    (
        'pt000000-0000-0000-0000-000000000003',
        NULL,
        'Execucao de Titulo - Cheque',
        'Peticao inicial de execucao de titulo extrajudicial baseada em cheque',
        'EXEC-CHEQUE',
        'execution',
        '{check}',
        '<h1>PETICAO INICIAL - EXECUCAO DE CHEQUE</h1><p>Template base para execucao de cheque. Customize conforme necessidade.</p>',
        'html',
        '[
            {"name": "debtor_name", "type": "string", "required": true},
            {"name": "total_amount", "type": "currency", "required": true},
            {"name": "check_number", "type": "string", "required": true}
        ]'::JSONB,
        true,
        true
    )
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    template_body = EXCLUDED.template_body,
    required_variables = EXCLUDED.required_variables,
    updated_at = NOW();

-- =============================================================================
-- VERIFICACAO
-- =============================================================================

SELECT
    'courts' AS table_name,
    COUNT(*) AS row_count
FROM courts
UNION ALL
SELECT 'petition_templates', COUNT(*) FROM petition_templates;

COMMIT;
