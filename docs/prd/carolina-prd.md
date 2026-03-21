# PRD — Carolina: Sistema de Automacao de Execucoes e Cobrancas Bancarias

**Produto:** Carolina
**Versao do Documento:** 1.0
**Data:** 2026-03-21
**Autor:** @pm (Morgan)
**Status:** Draft

---

## 1. Visao Geral do Produto

### 1.1 Problema

Escritorios de advocacia que representam cooperativas de credito operam um fluxo de execucoes e cobrancas quase integralmente manual. Com mais de 500 processos ativos simultaneos e aproximadamente 20 minutos gastos por peticao, o custo operacional e alto, a taxa de erro e significativa e a dependencia de mao de obra operacional limita a escalabilidade. A falta de padronizacao entre peticoes gera retrabalho e expoe o escritorio a riscos processuais.

### 1.2 Solucao

Carolina e um microSaaS juridico que automatiza o fluxo completo de execucoes e cobrancas bancarias — desde a entrada de documentos ate a geracao de peticoes prontas para protocolo — utilizando inteligencia artificial para extracao de dados, classificacao automatica e calculo de valores atualizados.

### 1.3 Proposta de Valor

| Metrica | Atual (Manual) | Com Carolina |
|---------|---------------|--------------|
| Tempo por peticao | ~20 min | ~3 min (revisao) |
| Taxa de erro | ~15-20% | < 2% |
| Capacidade operacional | ~25 peticoes/dia/pessoa | ~150 peticoes/dia/pessoa |
| Dependencia de pessoal | Alta | Baixa |
| Padronizacao | Inconsistente | 100% padronizado |

---

## 2. Personas

### P1 — Advogado Coordenador (Dr. Rafael)

- **Papel:** Socio ou coordenador da area de cobrancas do escritorio
- **Responsabilidades:** Supervisao estrategica, validacao final de peticoes complexas, relacionamento com cooperativas clientes, definicao de prioridades
- **Dores:** Falta de visibilidade sobre o volume e status dos processos, dificuldade em garantir qualidade sem revisar cada peticao, incapacidade de escalar a operacao sem contratar
- **Necessidades:** Dashboard com metricas em tempo real, alertas de anomalias, relatorios para clientes (cooperativas), controle de SLAs
- **Perfil tecnico:** Medio — usa sistemas juridicos, mas nao e tecnico

### P2 — Advogado Operacional (Dra. Camila)

- **Papel:** Advogada que prepara e revisa peticoes
- **Responsabilidades:** Revisao de peticoes geradas, ajustes pontuais, validacao juridica de calculos, protocolo de peticoes
- **Dores:** Volume excessivo de trabalho repetitivo, risco de erro por cansaco, falta de templates padronizados, retrabalho por documentos incompletos
- **Necessidades:** Peticoes pre-preenchidas com alta qualidade, interface de edicao rapida, checklist de validacao automatica, fila de trabalho organizada
- **Perfil tecnico:** Medio

### P3 — Estagiario (Lucas)

- **Papel:** Apoio operacional na entrada de documentos e tarefas de menor complexidade
- **Responsabilidades:** Upload de documentos, conferencia inicial de dados extraidos, organizacao de processos na fila
- **Dores:** Tarefas extremamente repetitivas, dificuldade em saber o que falta em cada processo, falta de orientacao clara sobre proximos passos
- **Necessidades:** Interface intuitiva com indicacoes claras, validacao automatica que sinalize o que falta, fluxo guiado passo a passo
- **Perfil tecnico:** Baixo

### P4 — Administrador do Escritorio (Sandra)

- **Papel:** Gestao administrativa e operacional
- **Responsabilidades:** Gestao de equipe, controle de produtividade, relatorios financeiros, configuracao do sistema
- **Dores:** Impossibilidade de medir produtividade individual, falta de previsibilidade de demanda, custos operacionais crescentes
- **Necessidades:** Relatorios de produtividade, gestao de usuarios e permissoes, configuracao de templates e regras de negocio, controle de custos por processo
- **Perfil tecnico:** Medio-baixo

---

## 3. Requisitos Funcionais

### 3.1 Modulo de Intake (Entrada)

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-001 | Upload manual de documentos | MUST | O sistema deve permitir upload de arquivos nos formatos PDF, JPG, PNG e TIFF, individualmente ou em lote (ate 50 arquivos por vez). Tamanho maximo por arquivo: 25 MB. |
| FR-002 | Upload via drag-and-drop | MUST | Interface de arrastar e soltar com barra de progresso e confirmacao visual de upload concluido. |
| FR-003 | Extracao automatica de e-mails | SHOULD | Integracao com caixas de e-mail (IMAP/SMTP) para monitorar pastas especificas e extrair automaticamente anexos de e-mails que correspondam a padroes configuraveis (remetente, assunto, palavras-chave). |
| FR-004 | Integracao via API com sistemas de cooperativas | SHOULD | API REST para receber pacotes de documentos diretamente de sistemas das cooperativas, com autenticacao via API Key ou OAuth 2.0. Endpoint de webhook para notificacao de novos lotes. |
| FR-005 | Pre-visualizacao de documentos | MUST | Visualizador de documentos embutido na interface, com zoom, rotacao e navegacao entre paginas, sem necessidade de download. |
| FR-006 | Organizacao em lotes | MUST | Agrupamento de documentos em lotes nomeados, com metadados (cooperativa de origem, data de recebimento, responsavel). Cada lote recebe um ID unico (LOTE-YYYYMMDD-NNN). |
| FR-007 | Deteccao de duplicatas | SHOULD | O sistema deve calcular hash de cada documento e alertar quando um documento identico ou similar (>95% de similaridade) ja existir na base. |
| FR-008 | Registro de origem e rastreabilidade | MUST | Todo documento deve registrar automaticamente: canal de entrada (upload manual, e-mail, API), timestamp, usuario responsavel, cooperativa de origem. |
| FR-009 | Validacao de formato na entrada | MUST | O sistema deve rejeitar arquivos corrompidos, com formato invalido ou ilegiveis, com mensagem clara do motivo da rejeicao. |
| FR-010 | Fila de entrada com status | MUST | Documentos recebidos entram em uma fila com status: Recebido, Em Processamento, Processado, Erro. Fila visivel para todos os usuarios com permissao. |

### 3.2 Modulo de Processamento (IA)

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-011 | OCR de documentos | MUST | Processamento OCR de cedulas de credito bancario (CCB), notas promissorias, contratos de emprestimo, fichas cadastrais e comprovantes. Suporte a documentos manuscritos com taxa de acuracia minima de 85%. Documentos impressos: acuracia minima de 97%. |
| FR-012 | Extracao de dados estruturados | MUST | Extrair automaticamente: nome completo do devedor, CPF/CNPJ, endereco, valor principal da divida, taxa de juros contratada, data de vencimento, numero do contrato, garantias. Dados extraidos devem ser apresentados em formato de formulario editavel. |
| FR-013 | Identificacao de partes processuais | MUST | Identificar e classificar automaticamente: devedor principal, avalistas/fiadores, conjuges (quando aplicavel), credor (cooperativa). Associar cada parte ao respectivo CPF/CNPJ e endereco. |
| FR-014 | Deteccao de assinaturas | SHOULD | Identificar campos de assinatura no documento e classificar como: assinado, em branco, ilegivel. Quando possivel, associar a assinatura a parte correspondente. |
| FR-015 | Classificacao automatica de tipo de titulo | MUST | Classificar o documento como: Cedula de Credito Bancario (CCB), Nota Promissoria, Contrato de Emprestimo Pessoal, Contrato de Financiamento, Cheque, Duplicata. Confianca minima de classificacao: 90%. |
| FR-016 | Extracao de clausulas relevantes | SHOULD | Identificar e extrair clausulas de: juros moratorios, juros remuneratorios, multa contratual, correcao monetaria (indice), vencimento antecipado, foro de eleicao, garantias reais e fidejussorias. |
| FR-017 | Score de confianca por campo | MUST | Cada campo extraido deve ter um score de confianca (0-100%). Campos com confianca abaixo de 80% devem ser sinalizados para revisao manual obrigatoria. |
| FR-018 | Reprocessamento manual | MUST | Permitir reprocessar um documento individualmente com parametros ajustados (ex: forcar orientacao, selecionar regiao de interesse). |
| FR-019 | Aprendizado continuo | COULD | O sistema deve registrar correcoes manuais feitas pelos usuarios e utilizar esses dados para melhorar a acuracia da extracao ao longo do tempo (feedback loop). |
| FR-020 | Processamento em fila assincrona | MUST | Documentos devem ser processados em fila assincrona com priorizacao configuravel. O usuario nao precisa aguardar o processamento para continuar trabalhando. |

### 3.3 Modulo de Validacao

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-021 | Checklist automatico de documentos | MUST | Para cada tipo de acao, o sistema deve verificar automaticamente se todos os documentos obrigatorios estao presentes. Checklists configuraveis por tipo de acao e comarca. |
| FR-022 | Checklist de execucao de titulo | MUST | Verificar obrigatoriamente: titulo executivo original (ou via digital), planilha de calculo, procuracao, contrato social do credor, comprovante de endereco do devedor, certidao de protesto (quando aplicavel). |
| FR-023 | Verificacao de completude de dados | MUST | Validar que todos os campos obrigatorios foram extraidos: dados completos do devedor, dados do credor, valor da divida, datas, numero do contrato. Sinalizar campos faltantes com indicacao de onde encontra-los. |
| FR-024 | Validacao de CPF/CNPJ | MUST | Verificar algoritmicamente a validade de CPF/CNPJ. Opcionalmente, consultar situacao cadastral via API da Receita Federal (SHOULD). |
| FR-025 | Verificacao de prescricao | MUST | Calcular automaticamente se a divida esta prescrita com base na data de vencimento e no tipo de titulo, utilizando prazos prescricionais do Codigo Civil (Art. 206): CCB = 5 anos; Nota Promissoria = 3 anos (acao cambial) / 5 anos (enriquecimento). Alertar quando a prescricao estiver proxima (< 90 dias). |
| FR-026 | Sinalizacao visual de problemas | MUST | Interface com semaforo: verde (completo e valido), amarelo (requer atencao/revisao), vermelho (bloqueante — nao pode prosseguir). Cada sinalizacao deve ter justificativa textual. |
| FR-027 | Relatorio de pendencias | MUST | Gerar relatorio consolidado de pendencias por processo, exportavel em PDF, listando: itens faltantes, campos com baixa confianca, alertas de prescricao, inconsistencias detectadas. |
| FR-028 | Validacao cruzada de dados | SHOULD | Cruzar dados extraidos de diferentes documentos do mesmo processo (ex: valor do contrato vs. valor da CCB, nome no contrato vs. nome na ficha cadastral) e sinalizar divergencias. |
| FR-029 | Registro de validacao manual | MUST | Quando um usuario valida manualmente um campo sinalizado, registrar: quem validou, quando, justificativa. Criar trilha de auditoria. |
| FR-030 | Bloqueio de avanco sem validacao | MUST | Processos com pendencias classificadas como "bloqueantes" (vermelho) nao podem avancar para as etapas seguintes do workflow ate resolucao. |

### 3.4 Modulo de Classificacao

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-031 | Classificacao de tipo de acao judicial | MUST | Classificar automaticamente a acao adequada: Acao de Execucao de Titulo Extrajudicial (Art. 784, CPC), Acao de Cobranca (rito ordinario), Acao Monitoria (Art. 700, CPC), Execucao Hipotecaria. Baseado em: tipo de titulo, valor, existencia de titulo executivo. |
| FR-032 | Classificacao de complexidade | MUST | Classificar o processo em niveis: Simples (devedor unico, titulo claro, sem garantia real), Medio (avalistas, garantia fidejussoria), Complexo (multiplos devedores, garantia real, questoes de prescricao, litisconsorcio). |
| FR-033 | Determinacao de competencia | SHOULD | Sugerir automaticamente o foro competente com base em: clausula de eleicao de foro, domicilio do devedor, local de pagamento. Considerar regras do CPC para competencia territorial. |
| FR-034 | Identificacao de litisconsorcio | MUST | Quando houver multiplos devedores/avalistas, identificar e sugerir formacao de litisconsorcio passivo. Indicar se litisconsorcio e necessario ou facultativo. |
| FR-035 | Sugestao de pedidos acessorios | SHOULD | Com base no tipo de acao e documentos, sugerir pedidos acessorios: citacao por hora certa, penhora online (SISBAJUD), busca de bens (RENAJUD, INFOJUD), arresto cautelar. |
| FR-036 | Regras configuraveis de classificacao | MUST | Administradores devem poder criar e editar regras de classificacao (ex: "se valor < R$ 40 salarios minimos e titulo executivo ausente, sugerir Monitoria"). Interface visual de regras no painel administrativo. |
| FR-037 | Historico de classificacoes | SHOULD | Manter historico de classificacoes por processo, incluindo reclassificacoes, com justificativa e responsavel pela alteracao. |
| FR-038 | Override manual com justificativa | MUST | Permitir que advogados alterem a classificacao sugerida pela IA, exigindo justificativa textual obrigatoria. |

### 3.5 Modulo de Calculo

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-039 | Calculo de valor atualizado da divida | MUST | Calcular o valor atualizado da divida a partir do valor principal, aplicando: correcao monetaria, juros remuneratorios (ate o vencimento), juros moratorios (apos o vencimento), multa contratual. Data-base configuravel (padrao: data do calculo). |
| FR-040 | Suporte a multiplos indices de correcao | MUST | Suportar os indices: INPC, IGPM, IPCA, CDI, TR, SELIC, Taxa Referencial. Atualizacao automatica dos indices via fontes oficiais (IBGE, BACEN). |
| FR-041 | Calculo de juros compostos e simples | MUST | Suportar ambos os regimes de capitalizacao conforme clausula contratual. Juros simples (padrao legal) e compostos (quando expressamente pactuado em CCB, conforme Lei 10.931/2004). |
| FR-042 | Calculo de honorarios advocaticios | MUST | Calcular automaticamente: honorarios contratuais (percentual configuravel sobre o debito), honorarios sucumbenciais estimados (10-20% conforme Art. 85, CPC). Permitir configuracao de percentuais por cooperativa. |
| FR-043 | Calculo de custas processuais | SHOULD | Estimar custas processuais com base na tabela de custas do tribunal competente (configuravel por estado/comarca). |
| FR-044 | Geracao de planilha de calculo | MUST | Gerar planilha detalhada em formato padrao judicial, contendo: demonstrativo de evolucao da divida, memoria de calculo com formulas, indices aplicados mes a mes, totais parciais e total geral. Exportavel em PDF e XLSX. |
| FR-045 | Simulacao de cenarios | SHOULD | Permitir simular o valor da divida em diferentes datas-base, com diferentes indices, para apoiar decisoes estrategicas (ex: "quanto sera o debito se protocolado em 30 dias?"). |
| FR-046 | Validacao de limites legais | MUST | Alertar quando o calculo resultar em: juros acima do limite legal (quando aplicavel), multa acima de 2% (relacoes de consumo), anatocismo nao autorizado contratualmente. |
| FR-047 | Atualizacao automatica de indices | MUST | Indices economicos devem ser atualizados automaticamente via API do Banco Central (SGS) ou IBGE, com frequencia minima diaria. Log de ultima atualizacao visivel na interface. |
| FR-048 | Memoria de calculo auditavel | MUST | Cada calculo deve gerar uma memoria completa com: parametros de entrada, formulas aplicadas, indices utilizados, resultado. A memoria deve ser armazenada e vinculada ao processo para auditoria. |

### 3.6 Modulo de Geracao de Peticao

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-049 | Templates por tipo de acao | MUST | Templates pre-configurados para: Peticao Inicial de Execucao de Titulo Extrajudicial, Peticao Inicial de Acao de Cobranca, Peticao Inicial de Acao Monitoria, Requerimentos diversos (penhora, habilitacao, etc.). Minimo de 5 templates no MVP. |
| FR-050 | Preenchimento automatico de dados | MUST | Todos os campos variaveis da peticao devem ser preenchidos automaticamente com dados extraidos e validados: qualificacao das partes, valores, datas, fundamentacao legal, pedidos. |
| FR-051 | Editor de texto integrado | MUST | Editor WYSIWYG embutido na interface para edicao pos-geracao, com: formatacao juridica padrao (fonte, espacamento, margens conforme normas do tribunal), controle de alteracoes (track changes), comparacao com versao original gerada. |
| FR-052 | Geracao com IA generativa | MUST | Utilizar modelo de linguagem para gerar secoes narrativas da peticao (fatos, fundamentacao juridica) com base nos dados do processo. O texto gerado deve ser juridicamente coerente e contextualizado. |
| FR-053 | Exportacao em multiplos formatos | MUST | Exportar peticoes em: PDF (padrao para protocolo), DOCX (para edicao avancada). Formatacao conforme normas do tribunal-alvo. |
| FR-054 | Versionamento de peticoes | MUST | Manter historico de versoes de cada peticao: v1 (gerada automaticamente), v2, v3... (edicoes). Permitir comparacao entre versoes e rollback. |
| FR-055 | Biblioteca de fundamentacao juridica | SHOULD | Base de trechos de fundamentacao juridica categorizados por tema (juros, correcao, titulo executivo, citacao), pesquisaveis e reutilizaveis. Atualizacao periodica com jurisprudencia relevante. |
| FR-056 | Numeracao automatica de paginas e documentos | MUST | Numerar automaticamente paginas da peticao e gerar indice de documentos anexos conforme exigencias de protocolo eletronico. |
| FR-057 | Validacao pre-exportacao | MUST | Antes de permitir exportacao, verificar: todos os campos variaveis foram preenchidos (nenhum placeholder restante como "{{nome}}"), formatacao esta conforme padrao, planilha de calculo anexada, documentos obrigatorios referenciados. |
| FR-058 | Templates customizaveis | MUST | Administradores devem poder criar, editar e clonar templates. Sistema de variaveis documentado (ex: {{devedor.nome}}, {{valor.total}}, {{data.vencimento}}). |
| FR-059 | Preview antes de exportacao | MUST | Visualizacao previa da peticao formatada antes da exportacao final, com renderizacao fiel ao PDF que sera gerado. |

### 3.7 Modulo de Workflow

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-060 | Pipeline com etapas definidas | MUST | Fluxo de trabalho com as seguintes etapas: Entrada → Processamento → Validacao → Classificacao → Calculo → Geracao → Revisao → Aprovado → Protocolado. Cada etapa com status visivel. |
| FR-061 | Atribuicao de responsaveis | MUST | Cada processo deve poder ser atribuido a um responsavel por etapa. Atribuicao automatica por regras (round-robin, carga de trabalho, especialidade) ou manual. |
| FR-062 | Notificacoes em tempo real | MUST | Notificacoes quando: processo avanca de etapa, processo e atribuido ao usuario, SLA esta proximo de estourar, erro detectado em processamento. Canais: in-app (obrigatorio), e-mail (configuravel). |
| FR-063 | Configuracao de SLAs | MUST | SLAs configuraveis por etapa do workflow: tempo maximo em cada etapa, alerta em percentual do SLA (ex: 75% do tempo), escalacao automatica em caso de estouro. SLAs padrao sugeridos: Entrada→Processamento (1h), Processamento→Validacao (automatico), Validacao→Revisao (4h), Revisao→Aprovacao (2h). |
| FR-064 | Filas de trabalho por perfil | MUST | Cada perfil de usuario visualiza sua fila de trabalho: estagiarios veem fila de entrada/validacao, advogados veem fila de revisao/aprovacao. Filtros por cooperativa, tipo de acao, prioridade. |
| FR-065 | Acoes em lote | SHOULD | Permitir acoes em lote sobre multiplos processos: atribuir responsavel, mover etapa, exportar, gerar relatorio. Selecao multipla com checkbox. |
| FR-066 | Comentarios e anotacoes por processo | MUST | Area de comentarios em cada processo, com mencoes (@usuario), anexos e historico cronologico. |
| FR-067 | Historico completo de atividades | MUST | Log de auditoria com todas as acoes realizadas em cada processo: quem, quando, o que. Incluindo alteracoes de dados, mudancas de status, edicoes de peticao. |
| FR-068 | Regras de transicao configuraveis | SHOULD | Administradores podem configurar condicoes para transicao entre etapas (ex: "so avanca para Geracao se todos os campos de validacao estiverem verdes"). |
| FR-069 | Processo de aprovacao com multiplos niveis | SHOULD | Suporte a aprovacao em dois niveis: advogado operacional (primeiro nivel), advogado coordenador (segundo nivel, para processos de alta complexidade). |
| FR-070 | Reprocessamento e retorno de etapa | MUST | Permitir devolver um processo para etapa anterior com justificativa obrigatoria (ex: "Revisao" → "Validacao" porque documento faltante). |

### 3.8 Modulo de Dashboard e Relatorios

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-071 | Dashboard operacional em tempo real | MUST | Visao consolidada com: total de processos por status, processos em atraso (SLA estourado), volume de entrada (hoje, semana, mes), taxa de processamento automatico bem-sucedido. |
| FR-072 | Metricas de produtividade | MUST | Por usuario e por equipe: processos concluidos por periodo, tempo medio por etapa, taxa de retrabalho (devolucoes). |
| FR-073 | Metricas de qualidade da IA | MUST | Acuracia de extracao OCR (por campo), taxa de classificacao correta, percentual de campos que necessitaram correcao manual, evolucao da acuracia ao longo do tempo. |
| FR-074 | Relatorio por cooperativa | MUST | Para cada cooperativa cliente: volume de processos, status, valores envolvidos, tempo medio de conclusao. Exportavel em PDF para envio ao cliente. |
| FR-075 | Filtros e segmentacao | MUST | Todos os dashboards devem suportar filtros por: periodo, cooperativa, tipo de acao, responsavel, status, complexidade. |
| FR-076 | Relatorio financeiro | SHOULD | Valor total em execucao, valor medio por processo, projecao de honorarios, custas estimadas. Agrupavel por cooperativa e periodo. |
| FR-077 | Exportacao de relatorios | MUST | Exportacao em PDF, XLSX e CSV. Agendamento de relatorios periodicos por e-mail (semanal, mensal). |
| FR-078 | Alertas configuraveis | SHOULD | Alertas automaticos quando: taxa de erro OCR ultrapassar limiar, SLA medio deteriorar, volume de entrada atipico. Configuraveis pelo administrador. |

### 3.9 Modulo de Administracao

| ID | Requisito | Prioridade | Detalhamento |
|----|-----------|------------|--------------|
| FR-079 | Gestao de usuarios e permissoes | MUST | CRUD de usuarios com perfis: Administrador, Advogado Coordenador, Advogado Operacional, Estagiario. Permissoes granulares por modulo e acao (visualizar, editar, aprovar, exportar). |
| FR-080 | Multi-tenancy por escritorio | MUST | Suporte a multiplos escritorios (tenants) com isolamento total de dados. Cada escritorio com suas configuracoes, templates e usuarios. |
| FR-081 | Cadastro de cooperativas | MUST | Cadastro de cooperativas clientes com: dados cadastrais, contratos de honorarios, regras especificas de calculo, templates preferenciais. |
| FR-082 | Configuracao de templates de peticao | MUST | Interface para criar, editar, versionar e ativar/desativar templates. Previewer de template com dados de exemplo. |
| FR-083 | Configuracao de regras de calculo | MUST | Interface para definir regras de calculo por cooperativa: indices de correcao, taxas de juros padrao, percentuais de honorarios, percentuais de multa. |
| FR-084 | Logs de auditoria do sistema | MUST | Log completo de todas as acoes administrativas: alteracoes de configuracao, gestao de usuarios, alteracoes de permissoes. Retencao minima de 5 anos (requisito legal). |
| FR-085 | Backup e exportacao de dados | MUST | Exportacao completa de dados do escritorio em formato estruturado (JSON/CSV). Backup automatico diario com retencao configuravel. |

---

## 4. Requisitos Nao-Funcionais

### 4.1 Performance

| ID | Requisito | Especificacao |
|----|-----------|---------------|
| NFR-001 | Tempo de resposta da interface | Todas as paginas devem carregar em menos de 2 segundos (P95). Interacoes do usuario (cliques, formularios) devem responder em menos de 500ms. |
| NFR-002 | Processamento OCR | Documento de ate 10 paginas deve ser processado em ate 60 segundos. Fila de processamento deve suportar pelo menos 100 documentos simultaneos. |
| NFR-003 | Geracao de peticao | Peticao completa deve ser gerada em ate 30 segundos, incluindo calculos e preenchimento de template. |
| NFR-004 | Geracao de relatorios | Relatorios com ate 10.000 registros devem ser gerados em ate 10 segundos. Relatorios maiores podem ser gerados de forma assincrona com notificacao. |
| NFR-005 | Escalabilidade horizontal | A arquitetura deve permitir escalar horizontalmente os workers de processamento OCR e geracao de peticoes independentemente do aplicativo web. |

### 4.2 Seguranca

| ID | Requisito | Especificacao |
|----|-----------|---------------|
| NFR-006 | Autenticacao | Autenticacao via e-mail/senha com requisitos minimos de complexidade. Suporte obrigatorio a MFA (TOTP ou SMS). SSO via SAML 2.0 ou OIDC (SHOULD). |
| NFR-007 | Autorizacao | RBAC (Role-Based Access Control) com perfis pre-definidos e permissoes granulares. Principio do menor privilegio. |
| NFR-008 | Criptografia em transito | Todas as comunicacoes via HTTPS (TLS 1.2+). Certificados SSL/TLS validos e renovados automaticamente. |
| NFR-009 | Criptografia em repouso | Dados sensiveis (documentos, dados pessoais) criptografados em repouso (AES-256). Chaves de criptografia gerenciadas por KMS. |
| NFR-010 | Conformidade LGPD | Mecanismos de anonimizacao e exclusao de dados pessoais sob demanda. Registro de consentimento e finalidade de tratamento. Relatorio de Impacto a Protecao de Dados Pessoais (RIPD). |
| NFR-011 | Isolamento de dados (multi-tenant) | Isolamento logico completo entre tenants. Nenhum tenant pode acessar dados de outro tenant em nenhuma circunstancia, mesmo via API. |
| NFR-012 | Prevencao contra ataques comuns | Protecao contra: SQL Injection, XSS, CSRF, Directory Traversal. Rate limiting em todas as APIs. CORS configurado adequadamente. |
| NFR-013 | Logs de seguranca | Registro de tentativas de login (sucesso/falha), alteracoes de permissao, acesso a dados sensiveis. Retencao minima de 1 ano. |

### 4.3 Usabilidade

| ID | Requisito | Especificacao |
|----|-----------|---------------|
| NFR-014 | Interface responsiva | A aplicacao deve funcionar em desktops (1280px+) e tablets (768px+). Otimizada para uso em desktop (fluxo de trabalho principal). |
| NFR-015 | Acessibilidade | Conformidade WCAG 2.1 nivel AA. Navegacao por teclado, leitores de tela, contraste adequado. |
| NFR-016 | Curva de aprendizado | Um estagiario deve ser capaz de realizar as operacoes basicas (upload, validacao) apos 2 horas de treinamento. Onboarding guiado na primeira utilizacao. |
| NFR-017 | Idioma | Interface 100% em portugues brasileiro. Mensagens de erro, tooltips e documentacao em PT-BR. |
| NFR-018 | Feedback visual | Toda acao do usuario deve ter feedback visual imediato: loading states, confirmacoes, mensagens de sucesso/erro com acoes sugeridas. |

### 4.4 Disponibilidade e Confiabilidade

| ID | Requisito | Especificacao |
|----|-----------|---------------|
| NFR-019 | Disponibilidade | SLA de 99.5% de uptime mensal (maximo ~3.6h de downtime/mes). Janela de manutencao programada: domingos 02h-06h (horario de Brasilia). |
| NFR-020 | Recuperacao de desastres | RPO (Recovery Point Objective): 1 hora. RTO (Recovery Time Objective): 4 horas. Backups automaticos com retencao de 30 dias. |
| NFR-021 | Resiliencia a falhas | Falha no processamento OCR de um documento nao deve afetar outros documentos na fila. Retry automatico com backoff exponencial (3 tentativas). |
| NFR-022 | Monitoramento | Monitoramento de saude da aplicacao, filas de processamento, consumo de recursos. Alertas automaticos para equipe de operacoes quando metricas ultrapassarem limiares. |

### 4.5 Manutenibilidade

| ID | Requisito | Especificacao |
|----|-----------|---------------|
| NFR-023 | Stack tecnologica padronizada | Frontend: React/Next.js com TypeScript. Backend: Node.js com TypeScript ou Python (FastAPI para servicos de IA). Banco de dados: PostgreSQL (Supabase). Fila: Redis/BullMQ. |
| NFR-024 | Testes automatizados | Cobertura minima de 80% em testes unitarios. Testes de integracao para fluxos criticos. Testes E2E para fluxos de usuario principais. |
| NFR-025 | CI/CD | Pipeline automatizado: lint, typecheck, testes, build, deploy. Ambientes: development, staging, production. |
| NFR-026 | Documentacao tecnica | API documentada com OpenAPI/Swagger. Documentacao de arquitetura atualizada. Runbooks para operacoes criticas. |

---

## 5. User Stories Principais

### 5.1 Intake

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-001 | Como **estagiario**, quero fazer upload de multiplos documentos de uma vez, para agilizar a entrada de processos em lote. | MUST |
| US-002 | Como **advogado operacional**, quero que e-mails de cooperativas sejam capturados automaticamente, para nao precisar baixar e fazer upload manual de cada documento. | SHOULD |
| US-003 | Como **estagiario**, quero visualizar o documento original ao lado dos dados extraidos, para conferir a extracao rapidamente. | MUST |
| US-004 | Como **administrador**, quero configurar a integracao via API com cada cooperativa, para receber documentos diretamente dos seus sistemas. | SHOULD |

### 5.2 Processamento

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-005 | Como **advogado operacional**, quero que a IA extraia automaticamente os dados da CCB, para nao precisar digitar manualmente cada campo. | MUST |
| US-006 | Como **advogado operacional**, quero ver o score de confianca de cada campo extraido, para saber quais dados preciso revisar com mais atencao. | MUST |
| US-007 | Como **advogado operacional**, quero corrigir dados extraidos incorretamente de forma inline, para que a correcao seja rapida e o sistema aprenda com meus ajustes. | MUST |
| US-008 | Como **administrador**, quero acompanhar a acuracia da IA ao longo do tempo, para avaliar se o sistema esta melhorando. | SHOULD |

### 5.3 Validacao e Classificacao

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-009 | Como **estagiario**, quero ver claramente o que esta faltando em cada processo (semaforo), para saber exatamente o que preciso providenciar. | MUST |
| US-010 | Como **advogado operacional**, quero que o sistema me alerte sobre prescricao iminente, para priorizar processos urgentes. | MUST |
| US-011 | Como **advogado operacional**, quero que o sistema sugira automaticamente o tipo de acao adequada, para reduzir o tempo de analise. | MUST |
| US-012 | Como **advogado coordenador**, quero poder alterar a classificacao de acao com justificativa, para exercer meu julgamento profissional quando necessario. | MUST |

### 5.4 Calculo

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-013 | Como **advogado operacional**, quero que o sistema calcule automaticamente o valor atualizado da divida, para eliminar erros de calculo manual. | MUST |
| US-014 | Como **advogado operacional**, quero gerar uma planilha de calculo no formato aceito pelo tribunal, para anexar a peticao sem retrabalho. | MUST |
| US-015 | Como **advogado coordenador**, quero configurar regras de calculo especificas por cooperativa, para respeitar particularidades contratuais de cada cliente. | MUST |
| US-016 | Como **advogado operacional**, quero simular cenarios de calculo com datas diferentes, para avaliar a melhor estrategia de ajuizamento. | SHOULD |

### 5.5 Geracao de Peticao

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-017 | Como **advogado operacional**, quero que a peticao seja gerada automaticamente com todos os dados preenchidos, para reduzir meu trabalho a apenas revisao. | MUST |
| US-018 | Como **advogado operacional**, quero editar a peticao gerada em um editor integrado, para fazer ajustes sem precisar exportar e reimportar. | MUST |
| US-019 | Como **advogado coordenador**, quero comparar a versao gerada pela IA com a versao editada pelo advogado, para avaliar a qualidade da geracao automatica. | SHOULD |
| US-020 | Como **administrador**, quero criar e gerenciar templates de peticao, para manter a padronizacao do escritorio. | MUST |

### 5.6 Workflow e Dashboard

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-021 | Como **advogado coordenador**, quero ver um dashboard com o status de todos os processos, para ter visibilidade completa da operacao. | MUST |
| US-022 | Como **advogado operacional**, quero ver minha fila de trabalho priorizada, para focar nos processos mais urgentes. | MUST |
| US-023 | Como **administrador**, quero configurar SLAs por etapa do workflow, para garantir que processos nao fiquem parados. | MUST |
| US-024 | Como **advogado coordenador**, quero receber alertas quando SLAs estiverem proximos de estourar, para intervir antes que haja atraso. | MUST |
| US-025 | Como **administrador**, quero gerar relatorios de produtividade por advogado, para avaliar desempenho da equipe. | MUST |
| US-026 | Como **advogado coordenador**, quero gerar relatorios por cooperativa, para enviar aos clientes demonstrando o andamento dos processos. | MUST |

### 5.7 Administracao

| ID | User Story | Prioridade |
|----|-----------|------------|
| US-027 | Como **administrador**, quero gerenciar usuarios e seus perfis de acesso, para controlar quem pode fazer o que no sistema. | MUST |
| US-028 | Como **administrador**, quero cadastrar cooperativas com suas regras especificas, para que o sistema aplique automaticamente as configuracoes corretas. | MUST |
| US-029 | Como **administrador**, quero ver logs de auditoria de todas as acoes, para garantir conformidade e rastreabilidade. | MUST |

---

## 6. Roadmap de Releases

### v1.0 — MVP (12 semanas)

**Objetivo:** Validar a proposta de valor com um fluxo funcional end-to-end para o caso mais comum (Execucao de Titulo Extrajudicial com devedor unico).

| Modulo | Escopo MVP | FRs Incluidos |
|--------|-----------|----------------|
| **Intake** | Upload manual (individual e lote), pre-visualizacao, fila de entrada | FR-001, FR-002, FR-005, FR-006, FR-008, FR-009, FR-010 |
| **Processamento** | OCR de CCB, extracao de dados estruturados, identificacao de partes, score de confianca, fila assincrona | FR-011, FR-012, FR-013, FR-015, FR-017, FR-018, FR-020 |
| **Validacao** | Checklist automatico, verificacao de completude, validacao CPF/CNPJ, prescricao, semaforo, bloqueio | FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-029, FR-030 |
| **Classificacao** | Classificacao de tipo de acao, complexidade, override manual | FR-031, FR-032, FR-034, FR-038 |
| **Calculo** | Calculo de divida atualizada (INPC, IGPM, CDI), honorarios, planilha judicial, validacao de limites, atualizacao de indices | FR-039, FR-040, FR-041, FR-042, FR-044, FR-046, FR-047, FR-048 |
| **Geracao** | 3 templates (Execucao, Cobranca, Monitoria), preenchimento automatico, editor basico, exportacao PDF/DOCX, versionamento, validacao pre-export | FR-049, FR-050, FR-051, FR-053, FR-054, FR-057, FR-059 |
| **Workflow** | Pipeline com 8 etapas, atribuicao manual, notificacoes in-app, historico de atividades, retorno de etapa | FR-060, FR-061, FR-062, FR-067, FR-070 |
| **Dashboard** | Dashboard operacional, metricas basicas de produtividade, filtros | FR-071, FR-072, FR-075, FR-077 |
| **Admin** | Gestao de usuarios/permissoes, cadastro de cooperativas, configuracao de regras de calculo, logs de auditoria | FR-079, FR-081, FR-083, FR-084 |

**NFRs do MVP:** NFR-001 a NFR-013, NFR-014, NFR-017, NFR-018, NFR-019, NFR-021, NFR-023, NFR-024, NFR-025

**Exclusoes do MVP:** Integracao com e-mail (FR-003), integracao via API com cooperativas (FR-004), deteccao de duplicatas (FR-007), deteccao de assinaturas (FR-014), extracao de clausulas (FR-016), aprendizado continuo (FR-019), multi-tenancy (FR-080), geracao com IA generativa completa (FR-052).

---

### v1.5 — Consolidacao (8 semanas apos MVP)

**Objetivo:** Incorporar feedback dos primeiros usuarios, melhorar acuracia da IA e adicionar integracoes essenciais.

| Area | Incrementos | FRs Incluidos |
|------|------------|----------------|
| **Intake** | Extracao de e-mails, deteccao de duplicatas | FR-003, FR-007 |
| **Processamento** | Deteccao de assinaturas, extracao de clausulas, aprendizado continuo | FR-014, FR-016, FR-019 |
| **Validacao** | Validacao cruzada, relatorio de pendencias | FR-027, FR-028 |
| **Classificacao** | Determinacao de competencia, sugestao de pedidos acessorios, regras configuraveis, historico | FR-033, FR-035, FR-036, FR-037 |
| **Calculo** | Custas processuais, simulacao de cenarios | FR-043, FR-045 |
| **Geracao** | Geracao com IA generativa, biblioteca de fundamentacao, templates customizaveis, numeracao automatica | FR-052, FR-055, FR-056, FR-058 |
| **Workflow** | SLAs configuraveis, filas por perfil, acoes em lote, comentarios, regras de transicao, aprovacao multinivel | FR-063, FR-064, FR-065, FR-066, FR-068, FR-069 |
| **Dashboard** | Metricas de IA, relatorios por cooperativa, relatorio financeiro, alertas | FR-073, FR-074, FR-076, FR-078 |
| **Admin** | Multi-tenancy, configuracao de templates, backup/exportacao | FR-080, FR-082, FR-085 |

**NFRs adicionais:** NFR-015 (acessibilidade), NFR-016 (curva de aprendizado), NFR-020 (DR), NFR-022 (monitoramento), NFR-026 (documentacao)

---

### v2.0 — Escala e Integracoes Avancadas (12 semanas apos v1.5)

**Objetivo:** Escalar para multiplos escritorios, integrar com ecossistema juridico e ampliar automacao.

| Area | Incrementos |
|------|------------|
| **Integracao com Tribunais** | Protocolo eletronico automatizado via APIs dos tribunais (PJe, e-SAJ, PROJUDI). Acompanhamento processual automatico (movimentacoes, citacoes, intimacoes). |
| **Integracao com Sistemas de Cooperativas** | API bidirecional com sistemas das cooperativas (FR-004 expandido). Retorno automatico de status processual ao sistema da cooperativa. |
| **SISBAJUD / RENAJUD / INFOJUD** | Integracao para requisicao automatica de bloqueio judicial, busca de veiculos e informacoes fiscais. Peticoes de penhora online automatizadas. |
| **Modulo de Acordo** | Calculo de propostas de acordo com diferentes cenarios de desconto. Geracao de termos de acordo. Controle de parcelas e inadimplemento. |
| **Assinatura Digital** | Integracao com certificado digital A1/A3 (ICP-Brasil). Assinatura de peticoes diretamente no sistema. |
| **App Mobile** | Aplicativo mobile para advogados coordenadores. Dashboard, aprovacoes e notificacoes push. |
| **Analytics Avancado** | Predicao de tempo de conclusao por processo. Analise de tendencias por cooperativa/comarca. Recomendacoes baseadas em dados historicos. |
| **Marketplace de Templates** | Comunidade de templates de peticao entre escritorios. Rating e revisao por pares. |
| **API Publica** | API documentada para integracao com outros sistemas juridicos. Webhooks para eventos do workflow. |

---

## 7. Metricas de Sucesso (KPIs)

### 7.1 Metricas de Eficiencia Operacional

| KPI | Baseline (Manual) | Meta MVP | Meta v2.0 | Como Medir |
|-----|-------------------|----------|-----------|------------|
| **Tempo medio por peticao** | 20 min | 5 min | 2 min | Timestamp de inicio/fim do processo no workflow |
| **Peticoes geradas por pessoa/dia** | 25 | 80 | 200 | Contagem de peticoes finalizadas / usuarios ativos |
| **Taxa de automacao** | 0% | 60% | 85% | % de processos que passam sem intervencao manual na extracao |
| **Reducao de FTEs operacionais** | Baseline | -40% | -70% | Headcount necessario para mesmo volume |

### 7.2 Metricas de Qualidade

| KPI | Baseline | Meta MVP | Meta v2.0 | Como Medir |
|-----|----------|----------|-----------|------------|
| **Taxa de erro em peticoes** | 15-20% | < 5% | < 1% | Peticoes devolvidas por erro / total protocoladas |
| **Acuracia do OCR (campos estruturados)** | N/A | > 90% | > 97% | Campos corretos / total de campos extraidos (amostragem semanal) |
| **Acuracia da classificacao de acao** | N/A | > 85% | > 95% | Classificacoes corretas / total (comparado com override manual) |
| **Taxa de retrabalho** | ~30% | < 10% | < 3% | Processos devolvidos a etapa anterior / total |

### 7.3 Metricas de Produto

| KPI | Meta MVP | Meta v2.0 | Como Medir |
|-----|----------|-----------|------------|
| **Adocao (DAU/MAU)** | > 60% | > 80% | Usuarios ativos diarios / mensais |
| **NPS (Net Promoter Score)** | > 30 | > 50 | Pesquisa trimestral |
| **Tempo de onboarding** | < 4h | < 2h | Tempo ate primeiro processo completo |
| **Taxa de completude do workflow** | > 70% | > 90% | Processos que chegam a "Protocolado" / total iniciados |
| **Feature utilization rate** | > 50% (features core) | > 70% | Features usadas / features disponiveis |

### 7.4 Metricas de Negocio

| KPI | Meta MVP | Meta v1.5 | Meta v2.0 | Como Medir |
|-----|----------|-----------|-----------|------------|
| **Escritorios ativos** | 1 (piloto) | 5 | 20 | Tenants com atividade no mes |
| **Processos processados/mes** | 200 | 1.500 | 10.000 | Total de processos finalizados |
| **MRR (Monthly Recurring Revenue)** | R$ 5K | R$ 30K | R$ 150K | Faturamento recorrente mensal |
| **Churn rate** | < 10% | < 5% | < 3% | Escritorios que cancelaram / total |
| **CAC (Customer Acquisition Cost)** | — | < R$ 5K | < R$ 3K | Custo total de aquisicao / novos clientes |
| **LTV/CAC** | — | > 3 | > 5 | Lifetime value / custo de aquisicao |
| **ROI para o escritorio** | 3x | 5x | 10x | (Economia gerada - custo do sistema) / custo do sistema |

### 7.5 Metricas de SLA e Operacao

| KPI | Meta | Como Medir |
|-----|------|------------|
| **Uptime** | > 99.5% | Monitoramento de disponibilidade |
| **Tempo medio de processamento OCR** | < 60s (10 paginas) | Logs de processamento |
| **Tempo de resposta da API (P95)** | < 500ms | APM (Application Performance Monitoring) |
| **Incidentes criticos/mes** | < 1 | Registro de incidentes |
| **MTTR (Mean Time to Recovery)** | < 2h | Timestamp de deteccao a resolucao |

---

## 8. Restricoes e Premissas

### 8.1 Restricoes

| ID | Restricao | Impacto |
|----|-----------|---------|
| CON-001 | LGPD exige consentimento e finalidade para tratamento de dados pessoais de devedores | Necessario modulo de compliance e termos de uso especificos |
| CON-002 | Sigilo profissional (Art. 7, Estatuto da OAB) exige seguranca rigorosa | Criptografia, isolamento de dados, controle de acesso granular |
| CON-003 | Formatos de protocolo eletronico variam por tribunal (PJe, e-SAJ, PROJUDI) | MVP focado em geracao de PDF/DOCX; integracao com tribunais na v2.0 |
| CON-004 | Indices economicos dependem de APIs externas (BACEN, IBGE) | Necessario fallback e cache para indisponibilidade temporaria |
| CON-005 | Qualidade dos documentos de entrada varia significativamente | OCR deve ter tratamento de imagem (deskew, contraste) e fallback para entrada manual |
| CON-006 | Regulamentacao de IA no judiciario brasileiro em evolucao | Sistema deve ser transparente sobre uso de IA, com revisao humana obrigatoria |

### 8.2 Premissas

| ID | Premissa | Risco se Falsa |
|----|----------|----------------|
| ASM-001 | Escritorio piloto disponibilizara pelo menos 200 processos reais para treinamento e teste | Acuracia da IA comprometida; necessario dados sinteticos |
| ASM-002 | Cooperativas fornecerão documentos em formato digital (PDF) | Se papel, necessario adicionar modulo de digitalizacao |
| ASM-003 | Advogados estao dispostos a adotar nova ferramenta | Se resistencia, necessario programa de change management |
| ASM-004 | Infraestrutura em nuvem (AWS/GCP/Vercel) disponivel | Se restricao on-premises, redesign de arquitetura |
| ASM-005 | Documentos seguem padroes relativamente consistentes por cooperativa | Se alta variabilidade, necessario mais treinamento da IA |

---

## 9. Arquitetura de Alto Nivel (Referencia)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │  Intake   │ │ Workflow │ │ Peticao  │ │ Dashboard  │ │
│  │  Module   │ │  Board   │ │  Editor  │ │  & Reports │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ API REST / WebSocket
┌──────────────────────┴──────────────────────────────────┐
│                   Backend (Node.js/Python)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Auth &   │ │ Workflow │ │ Calculo  │ │  Geracao   │ │
│  │ RBAC     │ │ Engine   │ │  Engine  │ │  Peticao   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Document │ │   OCR    │ │ Classif. │ │  Notific.  │ │
│  │ Manager  │ │ Service  │ │ Service  │ │  Service   │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│                     Infraestrutura                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Supabase │ │  Redis   │ │  Object  │ │   Queue    │ │
│  │(Postgres)│ │  Cache   │ │ Storage  │ │  (BullMQ)  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│  ┌──────────┐ ┌──────────┐                              │
│  │ LLM API  │ │ OCR API  │                              │
│  │(OpenAI/  │ │(Google   │                              │
│  │ Claude)  │ │ Vision)  │                              │
│  └──────────┘ └──────────┘                              │
└─────────────────────────────────────────────────────────┘
```

---

## 10. Glossario

| Termo | Definicao |
|-------|-----------|
| **CCB** | Cedula de Credito Bancario — titulo executivo extrajudicial emitido em operacoes de credito |
| **Execucao de Titulo Extrajudicial** | Acao judicial para cobrar divida representada por titulo executivo (CCB, nota promissoria, cheque) |
| **Acao de Cobranca** | Acao judicial para cobrar divida quando nao ha titulo executivo |
| **Acao Monitoria** | Acao especial para cobrar divida com prova escrita sem eficacia de titulo executivo |
| **Litisconsorcio** | Pluralidade de partes no mesmo polo (ativo ou passivo) de uma acao |
| **SISBAJUD** | Sistema de Busca de Ativos do Poder Judiciario (antigo BacenJud) |
| **RENAJUD** | Sistema de restricoes judiciais sobre veiculos automotores |
| **INFOJUD** | Sistema de informacoes ao Judiciario (dados da Receita Federal) |
| **PJe** | Processo Judicial Eletronico — sistema de tramitacao processual eletronica |
| **Anatocismo** | Capitalizacao de juros (juros sobre juros) |
| **LGPD** | Lei Geral de Protecao de Dados (Lei 13.709/2018) |
| **Multi-tenant** | Arquitetura onde uma instancia serve multiplos clientes com isolamento de dados |

---

## 11. Apendice: Mapeamento de Dependencias entre FRs

```
FR-001/002 (Upload) ──→ FR-011 (OCR) ──→ FR-012 (Extracao) ──→ FR-021 (Checklist)
                                                │                        │
                                                ▼                        ▼
                                          FR-013 (Partes) ──→ FR-031 (Classificacao)
                                          FR-015 (Tipo)   ──→ FR-031
                                          FR-017 (Score)  ──→ FR-026 (Semaforo)
                                                                         │
                                                                         ▼
                                                               FR-039 (Calculo) ──→ FR-044 (Planilha)
                                                                         │                    │
                                                                         ▼                    ▼
                                                               FR-049/050 (Peticao) ──→ FR-053 (Export)
                                                                         │
                                                                         ▼
                                                               FR-060 (Workflow) ──→ FR-071 (Dashboard)
```

---

**Documento elaborado por @pm (Morgan)**
**Synkra AIOS — Produto: Carolina**
**Versao: 1.0 | Status: Draft | Data: 2026-03-21**
