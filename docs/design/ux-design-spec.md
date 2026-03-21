# UX Design Specification — Carolina: Automação de Execuções e Cobranças Bancárias

**Agente:** @ux-design-expert (Uma)
**Data:** 2026-03-21
**Versão:** 1.0

---

## 1. Mapa de Telas (Screen Map)

### 1.1 Módulo Core — Fluxo Principal

| # | Tela | Rota Sugerida | Descrição |
|---|------|---------------|-----------|
| 1 | **Dashboard** | `/dashboard` | Visão geral: métricas, casos urgentes, pipeline resumido, atalhos rápidos |
| 2 | **Lista de Casos** | `/casos` | Tabela paginada com filtros avançados, busca full-text, bulk actions |
| 3 | **Detalhe do Caso** | `/casos/:id` | Ficha completa do caso com timeline, documentos, status, histórico |
| 4 | **Upload / Intake** | `/casos/novo` | Zona de upload com drag-and-drop, intake manual, importação em lote |
| 5 | **Revisão de Extração IA** | `/casos/:id/extracao` | Side-by-side: documento original vs. dados extraídos, com marcação de confiança |
| 6 | **Validação** | `/casos/:id/validacao` | Checklist visual dos dados obrigatórios, alertas de inconsistência |
| 7 | **Cálculo** | `/casos/:id/calculo` | Memória de cálculo detalhada, parâmetros editáveis, preview de valores |
| 8 | **Geração de Petição** | `/casos/:id/peticao` | Preview da petição gerada, editor inline, comparação com template |
| 9 | **Revisão Final** | `/casos/:id/revisao` | Checklist pré-protocolo, assinatura digital, aprovação do responsável |

### 1.2 Módulo Pipeline

| # | Tela | Rota Sugerida | Descrição |
|---|------|---------------|-----------|
| 10 | **Pipeline Kanban** | `/pipeline` | Board visual com colunas por etapa do fluxo, drag-and-drop para reclassificação |
| 11 | **Fila de Trabalho** | `/fila` | Visão pessoal do operador: "meus casos", ordenados por prioridade/prazo |

### 1.3 Módulo Exceções

| # | Tela | Rota Sugerida | Descrição |
|---|------|---------------|-----------|
| 12 | **Central de Exceções** | `/excecoes` | Lista de casos com problemas, agrupados por tipo de exceção |
| 13 | **Detalhe de Exceção** | `/excecoes/:id` | Contexto do erro, sugestões de resolução, ações disponíveis |

### 1.4 Módulo Configuração

| # | Tela | Rota Sugerida | Descrição |
|---|------|---------------|-----------|
| 14 | **Templates de Petição** | `/config/templates` | CRUD de templates, editor com variáveis, versionamento |
| 15 | **Configuração de Fórum** | `/config/foruns` | Cadastro de comarcas, varas, dados de protocolo |
| 16 | **Parâmetros de Cálculo** | `/config/calculos` | Índices, taxas, tabelas de honorários |
| 17 | **Regras de Classificação** | `/config/classificacao` | Critérios para classificação automática de tipo de ação |

### 1.5 Módulo Administração

| # | Tela | Rota Sugerida | Descrição |
|---|------|---------------|-----------|
| 18 | **Usuários** | `/admin/usuarios` | Gestão de usuários, papéis, permissões |
| 19 | **Organização** | `/admin/organizacao` | Dados da cooperativa/escritório, integrações |
| 20 | **Audit Log** | `/admin/auditoria` | Registro de todas as ações no sistema, filtros por período/usuário |
| 21 | **Relatórios** | `/relatorios` | Relatórios gerenciais: produtividade, volume, SLA, taxa de exceção |

---

## 2. Fluxo de Navegação

### 2.1 Happy Path (Fluxo Principal)

```
Login
  │
  ▼
Dashboard ──────────────────────────────────────────────────────┐
  │                                                             │
  ├─► [Botão "Novo Caso"] ──► Upload/Intake                    │
  │                              │                              │
  │                              ▼                              │
  │                        Processamento IA                     │
  │                        (background, com                     │
  │                         progress indicator)                 │
  │                              │                              │
  │                              ▼                              │
  │                     Revisão de Extração                     │
  │                     (side-by-side)                           │
  │                              │                              │
  │                         ┌────┴────┐                         │
  │                         │         │                         │
  │                    [Aprovar]  [Corrigir]                     │
  │                         │         │                         │
  │                         │    Edição manual                  │
  │                         │         │                         │
  │                         └────┬────┘                         │
  │                              │                              │
  │                              ▼                              │
  │                         Validação                           │
  │                        (checklist)                           │
  │                              │                              │
  │                         ┌────┴────┐                         │
  │                         │         │                         │
  │                    [Válido]  [Pendência]                     │
  │                         │         │                         │
  │                         │    Exceção criada                 │
  │                         │    automaticamente                │
  │                         │         │                         │
  │                         └────┬────┘                         │
  │                              │                              │
  │                              ▼                              │
  │                          Cálculo                            │
  │                     (automático + revisão)                  │
  │                              │                              │
  │                              ▼                              │
  │                     Geração de Petição                      │
  │                     (preview + edição)                       │
  │                              │                              │
  │                              ▼                              │
  │                       Revisão Final                         │
  │                     (checklist + aprovação)                  │
  │                              │                              │
  │                              ▼                              │
  │                        Protocolo                            │
  │                     (integração PJe/PROJUDI                 │
  │                      ou download para                       │
  │                      protocolo manual)                      │
  │                              │                              │
  │                              ▼                              │
  │                     Caso concluído                          │
  │                     (retorna ao Dashboard                   │
  │                      com atualização)                       │
  │                              │                              │
  └──────────────────────────────┘
```

### 2.2 Fluxos Alternativos

**Upload em Lote (Batch):**
```
Upload/Intake ──► Upload múltiplos arquivos
                      │
                      ▼
               Processamento em fila
               (progress bar global)
                      │
                      ▼
               Lista de casos criados
               com status individual
                      │
                      ▼
               Usuário seleciona caso
               para revisar individualmente
```

**Exceção na Extração:**
```
Revisão de Extração ──► IA com baixa confiança
                             │
                             ▼
                    Campo destacado em amarelo/vermelho
                    com tooltip "Confiança: 45%"
                             │
                        ┌────┴────┐
                        │         │
                   [Corrigir] [Ignorar e
                   manualmente  marcar como
                        │      exceção]
                        │         │
                        ▼         ▼
                   Continua   Central de
                   fluxo      Exceções
```

**Rejeição na Revisão Final:**
```
Revisão Final ──► Coordenador rejeita
                       │
                       ▼
                  Comentário obrigatório
                  anexado ao caso
                       │
                       ▼
                  Caso retorna para
                  etapa indicada
                  (Extração, Validação
                   ou Petição)
                       │
                       ▼
                  Notificação para
                  o operador responsável
```

### 2.3 Estrutura de Navegação

**Barra Lateral (Sidebar) — Persistente:**

```
┌─────────────────────┐
│  CAROLINA            │
│  ─────────────────── │
│  ◆ Dashboard         │
│  ◆ Pipeline          │
│  ◆ Casos             │
│  ◆ Fila de Trabalho  │
│  ◆ Exceções  [badge] │
│  ─────────────────── │
│  ◆ Relatórios        │
│  ─────────────────── │
│  ◆ Configurações     │
│  ◆ Administração     │
│  ─────────────────── │
│  [avatar] Paulo      │
│  Advogado            │
└─────────────────────┘
```

**Breadcrumbs — Contextuais:**
```
Dashboard > Casos > #2024-001234 > Extração IA
Dashboard > Pipeline > Validação
Configurações > Templates > Execução de Título
```

**Atalhos de teclado (power users):**

| Atalho | Ação |
|--------|------|
| `Ctrl+N` | Novo caso |
| `Ctrl+K` | Busca global (command palette) |
| `Ctrl+Enter` | Aprovar/Avançar etapa |
| `Esc` | Voltar/Fechar modal |
| `J` / `K` | Navegar entre casos na lista |

---

## 3. Componentes de UI Principais

### 3.1 Card de Caso

```
┌──────────────────────────────────────────────────────┐
│  #2024-001234                          [Em Validação] │
│  ─────────────────────────────────────────────────── │
│  Cooperativa Sicredi - Agência Passo Fundo           │
│  Devedor: João da Silva Santos                       │
│  Valor: R$ 45.230,00        Tipo: Execução de Título │
│  ─────────────────────────────────────────────────── │
│  ⏰ Prazo: 3 dias       👤 Maria (estagiária)       │
│  📎 3 documentos        Confiança IA: 92%            │
│                                                      │
│  [Ver Detalhes]  [Avançar →]                         │
└──────────────────────────────────────────────────────┘
```

**Variações do card:**
- **Compacto:** Para listagem em tabela (uma linha por caso)
- **Expandido:** Para o Kanban (card completo como acima)
- **Mini:** Para o Dashboard (apenas numero, devedor, status, prazo)

### 3.2 Status Badges

| Status | Cor | Ícone | Significado |
|--------|-----|-------|-------------|
| `Novo` | Cinza `#6B7280` | Círculo vazio | Caso recém-criado, aguardando processamento |
| `Processando` | Azul `#3B82F6` | Spinner animado | IA extraindo dados |
| `Extração Pronta` | Azul escuro `#1E40AF` | Lupa | Aguardando revisão humana da extração |
| `Em Validação` | Amarelo `#F59E0B` | Checklist | Dados sendo validados |
| `Validado` | Verde claro `#10B981` | Check simples | Dados confirmados |
| `Calculando` | Roxo `#8B5CF6` | Calculadora | Cálculo em processamento |
| `Petição Gerada` | Indigo `#6366F1` | Documento | Petição pronta para revisão |
| `Em Revisão` | Laranja `#F97316` | Olho | Coordenador revisando |
| `Aprovado` | Verde `#059669` | Check duplo | Pronto para protocolo |
| `Protocolado` | Verde escuro `#047857` | Selo | Protocolado no tribunal |
| `Exceção` | Vermelho `#EF4444` | Exclamação | Requer intervenção manual |
| `Arquivado` | Cinza escuro `#374151` | Pasta | Caso finalizado |

### 3.3 Componente de Revisão de Extração IA (Side-by-Side)

Este e o componente mais critico do sistema. Aqui o advogado valida o que a IA extraiu.

```
┌────────────────────────────┬────────────────────────────┐
│   DOCUMENTO ORIGINAL       │   DADOS EXTRAÍDOS          │
│   ─────────────────────    │   ─────────────────────    │
│                            │                            │
│   [PDF viewer com zoom     │   Credor:                  │
│    e scroll sincronizado   │   ┌──────────────────────┐ │
│    com os campos ao lado]  │   │ Sicredi Passo Fundo  │ │
│                            │   └──────────────────────┘ │
│   O trecho relevante       │   Confiança: ████████░░ 87%│
│   fica DESTACADO no PDF    │                            │
│   quando o campo ao lado   │   Devedor:                 │
│   recebe foco.             │   ┌──────────────────────┐ │
│                            │   │ João da Silva Santos │ │
│                            │   └──────────────────────┘ │
│                            │   Confiança: ██████████ 98%│
│                            │                            │
│                            │   CPF:                     │
│                            │   ┌──────────────────────┐ │
│                            │   │ 012.345.678-90      │ │
│                            │   └──────────────────────┘ │
│                            │   Confiança: ████░░░░░░ 42%│
│                            │   ⚠ Verificar no documento │
│                            │                            │
│                            │   Valor Principal:         │
│                            │   ┌──────────────────────┐ │
│                            │   │ R$ 45.230,00         │ │
│                            │   └──────────────────────┘ │
│                            │   Confiança: ██████████ 99%│
│                            │                            │
│                            │   [Aprovar Todos ✓]        │
│                            │   [Aprovar e Avançar →]    │
└────────────────────────────┴────────────────────────────┘
```

**Comportamentos chave deste componente:**

1. **Indicador de confianca por campo:** Barra de progresso colorida (verde > 80%, amarelo 50-80%, vermelho < 50%)
2. **Highlight sincronizado:** Ao clicar/focar em um campo extraído, o trecho correspondente no PDF original fica destacado com borda amarela
3. **Edição inline:** Cada campo e editavel diretamente, sem modal
4. **Atalhos de teclado:** `Tab` avança entre campos, `Enter` confirma, `Ctrl+Enter` aprova todos
5. **Campos com baixa confiança:** Automaticamente expandidos com alerta visual, os demais colapsáveis
6. **Log de alterações:** Qualquer edição manual é registrada ("Valor alterado de R$ 45.230 para R$ 45.320 por Maria em 21/03/2026 14:32")

### 3.4 Componente de Validação (Checklist)

```
┌─────────────────────────────────────────────────────┐
│  VALIDAÇÃO DO CASO #2024-001234                     │
│  ────────────────────────────────────────────────── │
│                                                     │
│  Dados Obrigatórios                    8/10 ✓       │
│  ─────────────────────                              │
│  [✓] Identificação do credor                        │
│  [✓] Identificação do devedor                       │
│  [✓] CPF/CNPJ do devedor                           │
│  [✓] Endereço do devedor                            │
│  [✓] Valor principal                                │
│  [✓] Data de vencimento                             │
│  [✓] Título executivo identificado                  │
│  [✓] Fórum competente definido                      │
│  [!] Cálculo de juros — dados insuficientes         │
│      └─ [Informar manualmente] [Marcar exceção]     │
│  [✗] Certidão de protesto — documento ausente       │
│      └─ [Upload] [Dispensar com justificativa]      │
│                                                     │
│  Verificações Automáticas              3/3 ✓        │
│  ─────────────────────                              │
│  [✓] CPF válido (Receita Federal)                   │
│  [✓] Comarca correta para endereço                  │
│  [✓] Valor dentro do limite para rito               │
│                                                     │
│  ──────────────────────────────────────────────────  │
│  Progresso: ████████████████░░ 85%                  │
│                                                     │
│  [Salvar Rascunho]  [Marcar Exceção]  [Validar →]  │
└─────────────────────────────────────────────────────┘
```

### 3.5 Editor de Petição

```
┌─────────────────────────────────────────────────────┐
│  PETIÇÃO — Execução de Título Extrajudicial         │
│  Caso #2024-001234                                  │
│  ────────────────────────────────────────────────── │
│                                                     │
│  Template: Execução CCB v3.2   [Trocar Template ▼]  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │                                               │  │
│  │  EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A)       │  │
│  │  JUIZ(A) DE DIREITO DA _2ª_ VARA CÍVEL DA   │  │
│  │  COMARCA DE _PASSO FUNDO/RS_                 │  │
│  │                                               │  │
│  │  [Variáveis destacadas em azul claro]         │  │
│  │  [Texto livre em preto]                       │  │
│  │  [Seções colapsáveis por capítulo]            │  │
│  │                                               │  │
│  │  (...conteúdo da petição...)                   │  │
│  │                                               │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌─── Painel Lateral ──────────────────────────┐   │
│  │ Variáveis usadas:                            │   │
│  │ {{credor}} = Sicredi Passo Fundo             │   │
│  │ {{devedor}} = João da Silva Santos           │   │
│  │ {{valor}} = R$ 45.230,00                     │   │
│  │ {{comarca}} = Passo Fundo/RS                 │   │
│  │ {{vara}} = 2ª Vara Cível                     │   │
│  │                                              │   │
│  │ Documentos anexos:                           │   │
│  │ [✓] CCB nº 12345                             │   │
│  │ [✓] Demonstrativo de débito                  │   │
│  │ [✓] Procuração                               │   │
│  │ [ ] Certidão de protesto (pendente)          │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  [PDF Preview]  [Salvar]  [Enviar p/ Revisão →]    │
└─────────────────────────────────────────────────────┘
```

**Comportamentos chave:**
- Variáveis preenchidas automaticamente sao destacadas em azul claro com borda pontilhada, clicáveis para edição
- Texto livre adicionado pelo advogado em fonte preta sem destaque
- Seções da petição colapsáveis (Fatos, Fundamentos, Pedidos, etc.)
- Diff mode: comparar petição gerada vs. template original
- Auto-save a cada 30 segundos
- Controle de versão inline ("Versão 3 — editada por Maria há 5 min")

### 3.6 Upload Zone

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│           ┌─────────────────────────────┐           │
│           │                             │           │
│           │    Arraste arquivos aqui    │           │
│           │    ou clique para buscar    │           │
│           │                             │           │
│           │    PDF, DOC, DOCX, XLS      │           │
│           │    Máx: 50MB por arquivo    │           │
│           │                             │           │
│           └─────────────────────────────┘           │
│                                                     │
│  Arquivos selecionados:                             │
│  ────────────────────                               │
│  ✓ CCB_12345.pdf (2.3MB)              [Remover]     │
│  ✓ demonstrativo_debito.xlsx (450KB)  [Remover]     │
│  ⟳ contrato_social.pdf (12MB)         Enviando 45%  │
│                                                     │
│  ────────────────────────────────────────────────── │
│  Tipo de ação:  [Execução de Título ▼]              │
│  Cooperativa:   [Sicredi Passo Fundo ▼]             │
│  Responsável:   [Auto-atribuir ▼]                   │
│                                                     │
│  [ ] Processamento em lote (criar caso por arquivo) │
│                                                     │
│  [Cancelar]                    [Criar Caso →]       │
└─────────────────────────────────────────────────────┘
```

### 3.7 Kanban Board (Pipeline)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│ Novo (12)│Extract(8)│Valid.(15)│Petição(6)│Revisão(4)│Protoc.(3)│
│──────────│──────────│──────────│──────────│──────────│──────────│
│          │          │          │          │          │          │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │
│ │#1234 │ │ │#1230 │ │ │#1225 │ │ │#1220 │ │ │#1215 │ │ │#1210 │ │
│ │Silva │ │ │Costa │ │ │Souza │ │ │Lima  │ │ │Alves │ │ │Rocha │ │
│ │45.2K │ │ │12.8K │ │ │78.1K │ │ │23.0K │ │ │56.4K │ │ │34.7K │ │
│ │3 dias│ │ │IA 92%│ │ │8/10 ✓│ │ │v2    │ │ │coord.│ │ │PJe   │ │
│ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │ └──────┘ │
│          │          │          │          │          │          │
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │          │          │
│ │#1235 │ │ │#1231 │ │ │#1226 │ │          │          │          │
│ │Pereira│ │ │Ramos │ │ │Ferr. │ │          │          │          │
│ │...   │ │ │...   │ │ │...   │ │          │          │          │
│ └──────┘ │ └──────┘ │ └──────┘ │          │          │          │
│          │          │          │          │          │          │
│ +10 mais │ +6 mais  │ +13 mais │          │          │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

Filtros: [Cooperativa ▼] [Responsável ▼] [Prazo ▼] [Tipo ▼]
```

### 3.8 Sistema de Notificações

**Tipos de notificação:**

| Tipo | Localização | Persistência | Exemplo |
|------|-------------|--------------|---------|
| **Toast** | Canto superior direito | 5 segundos | "Caso #1234 criado com sucesso" |
| **Banner** | Topo da página | Até dispensar | "3 casos com prazo vencendo hoje" |
| **Badge** | Sidebar / Ícone | Até visualizar | Exceções (5), Revisões pendentes (3) |
| **Inline** | Dentro do formulário | Permanente | "CPF inválido — verificar dígitos" |
| **Push** | Navegador | Até clicar | "Coordenador aprovou caso #1234" |

**Centro de notificações (bell icon no header):**
- Lista cronológica de todas as notificações
- Filtros por tipo: Ação necessária, Informativo, Sistema
- Marcar como lida / marcar todas como lidas
- Link direto para o caso/tela relevante

---

## 4. Design System Recommendations

### 4.1 Paleta de Cores

A identidade visual deve transmitir: **confiança, profissionalismo, seriedade** — atributos essenciais no contexto juridico. Evitar cores vibrantes demais ou paletas "startup-tech".

**Cores primárias:**

| Nome | Hex | Uso |
|------|-----|-----|
| Navy | `#1E3A5F` | Headers, sidebar background, botões primários |
| Navy Light | `#2D5F8B` | Hover states, links ativos |
| Navy Dark | `#0F1F33` | Texto principal em headers |

**Cores secundárias:**

| Nome | Hex | Uso |
|------|-----|-----|
| Warm Gray | `#F5F3F0` | Background principal (warm, nao frio) |
| White | `#FFFFFF` | Cards, modais, áreas de conteúdo |
| Border | `#E5E2DE` | Bordas de cards, separadores |
| Text Primary | `#1A1A1A` | Texto principal do corpo |
| Text Secondary | `#6B7280` | Labels, texto auxiliar |
| Text Muted | `#9CA3AF` | Placeholders, texto desabilitado |

**Cores funcionais (status):**

| Nome | Hex | Uso |
|------|-----|-----|
| Success | `#059669` | Validação ok, caso aprovado |
| Warning | `#D97706` | Atenção necessária, confiança media |
| Error | `#DC2626` | Erro, exceção, confiança baixa |
| Info | `#2563EB` | Informações, processamento IA |
| Purple | `#7C3AED` | Ações da IA, automação |

**Cores de confiança IA (gradiente dedicado):**

| Faixa | Cor | Significado |
|-------|-----|-------------|
| 90-100% | `#059669` (verde) | Alta confiança, provavel acerto |
| 70-89% | `#2563EB` (azul) | Boa confiança, verificar rapidamente |
| 50-69% | `#D97706` (amarelo) | Media confiança, revisar com atenção |
| 0-49% | `#DC2626` (vermelho) | Baixa confiança, verificação obrigatória |

### 4.2 Tipografia

| Elemento | Font | Weight | Size | Line Height |
|----------|------|--------|------|-------------|
| H1 (título de página) | Inter | 700 | 24px | 32px |
| H2 (seção) | Inter | 600 | 20px | 28px |
| H3 (subseção) | Inter | 600 | 16px | 24px |
| Body | Inter | 400 | 14px | 22px |
| Body Small | Inter | 400 | 13px | 20px |
| Label | Inter | 500 | 12px | 16px |
| Caption | Inter | 400 | 11px | 16px |
| Monospace (valores, CPF) | JetBrains Mono | 400 | 14px | 22px |
| Petição (editor) | Merriweather | 400 | 15px | 28px |

**Justificativas:**
- **Inter** para interface: excelente legibilidade em telas, amplo suporte a pesos, profissional sem ser generico
- **Merriweather** para petições: serifada, alta legibilidade em textos longos, remete a documentos juridicos
- **JetBrains Mono** para dados: distinção clara entre 0/O, 1/l, ideal para CPF/CNPJ/valores

### 4.3 Spacing System

Base unit: **4px**

| Token | Valor | Uso |
|-------|-------|-----|
| `space-1` | 4px | Inline spacing minimo |
| `space-2` | 8px | Padding interno de badges, gap entre ícone e texto |
| `space-3` | 12px | Padding interno de inputs |
| `space-4` | 16px | Padding de cards, gap entre elementos de form |
| `space-5` | 20px | Margin entre seções menores |
| `space-6` | 24px | Padding de seções, gap entre cards |
| `space-8` | 32px | Margin entre seções maiores |
| `space-10` | 40px | Padding de páginas (lateral) |
| `space-12` | 48px | Header height |
| `space-16` | 64px | Separação entre módulos |

**Border Radius:**

| Token | Valor | Uso |
|-------|-------|-----|
| `radius-sm` | 4px | Badges, tags |
| `radius-md` | 8px | Cards, inputs, botões |
| `radius-lg` | 12px | Modais, dropdowns |
| `radius-full` | 9999px | Avatars, indicadores circulares |

### 4.4 Componentes Reutilizáveis (Component Library)

**Tier 1 — Primitivos:**
- Button (primary, secondary, ghost, danger, sizes: sm/md/lg)
- Input (text, number, currency, date, select, multiselect)
- Checkbox, Radio, Toggle
- Badge (status, confiança IA, contagem)
- Avatar (com initials fallback)
- Tooltip, Popover
- Icon (Lucide Icons — conjunto consistente e profissional)

**Tier 2 — Compostos:**
- Card (caso, métrica, ação rápida)
- Table (sortable, filterable, paginada, selectable, com bulk actions)
- Form Group (label + input + error + helper text)
- Modal (confirmação, formulário, full-screen para editor)
- Dropdown Menu
- Tabs
- Breadcrumbs
- Stepper (progresso do caso)
- Empty State (ilustração + CTA)

**Tier 3 — Domínio:**
- CaseCard (card de caso com status, prazo, responsável)
- ConfidenceBar (barra de confiança IA com cores e porcentagem)
- ExtractionField (campo extraído com confiança, edição inline, link para PDF)
- ValidationChecklist (checklist com estados ok/warning/error)
- PetitionEditor (editor rich text com variáveis e templates)
- KanbanColumn (coluna do pipeline com contador e scroll virtual)
- TimelineEvent (evento na timeline do caso)
- CurrencyInput (input formatado para R$ com máscara)
- CPFCNPJInput (input com máscara e validação)

### 4.5 Dark Mode

**Recomendação: Nao para o MVP. Incluir na v2.**

Justificativa:
- O público-alvo (advogados, estagiários) trabalha predominantemente em horário comercial
- O contexto juridico favorece ambientes claros (analogia com papel, documentos impressos)
- O custo de implementação e manutenção de dark mode é significativo
- Priorizar funcionalidades core no MVP

Para a v2, implementar usando CSS custom properties ja definidas no design system, tornando a migração simples.

### 4.6 Responsividade

**Breakpoints:**

| Nome | Width | Comportamento |
|------|-------|---------------|
| Mobile | < 768px | **Nao suportado no MVP.** Exibir mensagem: "Use um computador para melhor experiência" |
| Tablet | 768-1024px | Sidebar colapsável, tabelas com scroll horizontal, cards empilhados |
| Desktop | 1024-1440px | Layout padrão com sidebar expandida |
| Wide | > 1440px | Layout com painéis side-by-side (extração IA), tabelas com mais colunas visíveis |

**Justificativa para excluir mobile no MVP:**
- O trabalho juridico de alto volume é feito em desktop
- A revisão de documentos PDF lado a lado exige tela grande
- A edição de petições requer teclado físico
- Os tribunais (PJe/PROJUDI) só funcionam bem em desktop

---

## 5. UX Patterns Críticos

### 5.1 Exibição de Resultados da IA para Validação Humana

Este é o padrão mais importante do sistema. O objetivo é que o advogado confie nos dados de alta confiança e foque atenção nos de baixa confiança.

**Princípio: "Confiança Progressiva"**

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  NÍVEL 1 — Campos de Alta Confiança (>= 90%)                  │
│  ─────────────────────────────────────────────                  │
│  Exibidos como "já aprovados" (check verde sutil)               │
│  Editáveis com um clique, mas visualmente confirmados           │
│  O advogado pode apenas ESCANEAR rapidamente                    │
│                                                                 │
│  NÍVEL 2 — Campos de Média Confiança (50-89%)                  │
│  ─────────────────────────────────────────────                  │
│  Exibidos com borda amarela e ícone de atenção                  │
│  Campo aberto para edição, highlight no PDF sincronizado        │
│  O advogado deve VERIFICAR e CONFIRMAR                          │
│                                                                 │
│  NÍVEL 3 — Campos de Baixa Confiança (<50%)                    │
│  ─────────────────────────────────────────────                  │
│  Exibidos com borda vermelha, fundo rosa claro                  │
│  Campo obrigatoriamente aberto, com sugestão da IA mas          │
│  placeholder pedindo input manual                               │
│  O advogado DEVE PREENCHER/CONFIRMAR manualmente                │
│                                                                 │
│  NÍVEL 4 — Campos Não Encontrados                              │
│  ─────────────────────────────────────────────                  │
│  Exibidos como vazios com borda tracejada vermelha              │
│  Indicação "Não encontrado no documento"                        │
│  Botão "Localizar no PDF" para busca manual                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Interações complementares:**

- **Aprovar em massa:** Botao "Aprovar todos de alta confiança" para economizar tempo em casos rotineiros (comum em 80% dos casos)
- **Reordenação por confiança:** Opção de ordenar campos por confiança (menor primeiro) para focar no que precisa de atenção
- **Comparação com caso similar:** Tooltip mostrando "Em 95% dos casos similares, este campo teve valor X"
- **Undo global:** Botão para desfazer todas as aprovações e recomeçar a revisão

### 5.2 Revisão Eficiente de Petição Gerada

**Princípio: "Revisão por Camadas"**

A petição gerada pode ter 15-30 páginas. O advogado nao pode ler tudo a cada caso. O sistema deve guiar a atenção.

**Camada 1 — Resumo de Mudanças (primeira coisa que o advogado vê):**
```
┌─────────────────────────────────────────────────────┐
│  RESUMO DA PETIÇÃO GERADA                           │
│  ────────────────────────────────────────────────── │
│                                                     │
│  Template usado: Execução CCB v3.2                  │
│  Variáveis preenchidas: 14/14 ✓                     │
│  Seções padrão: 7/7 ✓                               │
│  Seções customizadas: 0                              │
│                                                     │
│  ⚠ Atenção:                                        │
│  - Valor dos honorários calculado em 10% (padrão)   │
│  - Pedido de tutela antecipada INCLUÍDO (CCB > 30K) │
│  - Citação por correio (padrão comarca PF/RS)       │
│                                                     │
│  [Revisar Petição Completa]  [Aprovar Direto →]    │
└─────────────────────────────────────────────────────┘
```

**Camada 2 — Navegação por seções:**
- Sidebar com sumário clicável (Qualificação, Fatos, Fundamentos, Pedidos, Documentos)
- Cada seção com indicador: "Padrão" (cinza) ou "Customizado" (azul)
- Somente seções customizadas ou com alertas precisam de atenção

**Camada 3 — Diff mode:**
- Comparar petição gerada vs. template original
- Apenas as diferenças são destacadas (verde = adicionado, vermelho = removido)
- Útil para coordenadores que revisam petições de estagiários

**Camada 4 — Edição inline:**
- Click-to-edit em qualquer trecho
- Toolbar minimalista (negrito, itálico, lista)
- Variáveis não editáveis diretamente (redireciona para dados do caso)
- Auto-save com indicador visual

### 5.3 Tratamento de Exceções sem Interromper o Fluxo

**Princípio: "Exceções são Desvios, Não Bloqueios"**

O sistema nunca deve parar completamente. Quando uma exceção ocorre em um caso, os demais 499 casos continuam fluindo.

**Mecanismo:**

```
Caso normal ──────────────────────────► Fluxo normal
                                          │
Caso com exceção ──► Exceção criada ──►  Fila de exceções
                     automaticamente      (sidebar badge)
                          │
                          ├─ Caso fica "pausado" na etapa atual
                          ├─ Notificação para responsável
                          ├─ NÃO bloqueia outros casos
                          └─ Resolvível a qualquer momento
```

**Tipos de exceção e tratamento:**

| Tipo | Severidade | Ação Automática | Ação Humana |
|------|------------|-----------------|-------------|
| Documento ilegível | Alta | Pausa caso, notifica | Re-upload ou digitação manual |
| Campo não encontrado (obrigatório) | Alta | Pausa na validação | Preencher manualmente |
| CPF/CNPJ inválido | Média | Marca campo, alerta | Corrigir dados |
| Valor divergente entre documentos | Média | Marca ambos, alerta | Escolher valor correto |
| Template não encontrado para tipo | Alta | Pausa na geração | Criar template ou reclassificar |
| Comarca não cadastrada | Média | Pausa na geração | Cadastrar comarca |
| Prazo vencido/urgente | Info | Prioriza na fila | Ação imediata |

**Central de Exceções — UX:**
- Agrupamento por tipo (accordion)
- Contador de exceções por tipo
- Ações em lote para exceções do mesmo tipo ("Aplicar solução para todos os 5 casos com CPF inválido")
- Indicação de tempo na fila ("Há 3 dias aguardando resolução")
- SLA visual (barra de tempo, muda de verde para vermelho)

### 5.4 Visibilidade do Volume de Trabalho

**Princípio: "Clareza Operacional"**

Com 500+ casos, o advogado/coordenador precisa de visão macro e capacidade de drill-down.

**Dashboard — Layout:**

```
┌──────────────────────────────────────────────────────────────┐
│  DASHBOARD — Boa tarde, Maria                    21/03/2026  │
│  ─────────────────────────────────────────────────────────── │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │   127    │ │    45    │ │    12    │ │  R$ 3.2M │       │
│  │ Casos    │ │ Em       │ │ Exceções │ │ Valor    │       │
│  │ Ativos   │ │ Andamento│ │ Pendentes│ │ Total    │       │
│  │ ↑ 8 hoje │ │ ↑ 3 hoje │ │ ↓ 2 hoje │ │ em exec. │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  ┌────────────────────────────┐ ┌───────────────────────┐   │
│  │  PIPELINE (últimos 30d)    │ │  MINHA FILA            │   │
│  │  ─────────────────────     │ │  ──────────────        │   │
│  │  Novos      ████████ 32   │ │  Próximo: #1234        │   │
│  │  Extração   █████ 18      │ │  Silva - R$ 45K        │   │
│  │  Validação  ███████████ 45 │ │  Prazo: hoje           │   │
│  │  Petição    ███ 12         │ │  ─────────────         │   │
│  │  Revisão    ██ 8           │ │  Depois: #1235         │   │
│  │  Protocolo  ████ 12        │ │  Pereira - R$ 12K     │   │
│  │                            │ │  Prazo: amanhã         │   │
│  │  [Ver Pipeline →]          │ │  ─────────────         │   │
│  └────────────────────────────┘ │  +14 casos na fila    │   │
│                                 │  [Ver Fila →]          │   │
│  ┌────────────────────────────┐ └───────────────────────┘   │
│  │  AÇÕES URGENTES            │                             │
│  │  ──────────────            │                             │
│  │  ⚠ 3 casos vencendo hoje  │                             │
│  │  ⚠ 2 revisões pendentes   │                             │
│  │  ⚠ 5 exceções não tratadas │                             │
│  │  (há mais de 24h)          │                             │
│  └────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────┘
```

**Métricas para coordenador:**
- Produtividade por operador (casos/dia, tempo médio por etapa)
- Gargalos no pipeline (onde estão acumulando casos)
- Taxa de exceção por cooperativa (qual cooperativa manda documentos ruins)
- SLA compliance (% de casos dentro do prazo)
- Trend line (volume crescendo? diminuindo?)

**Fila de Trabalho pessoal:**
- Ordenação inteligente: prazo > prioridade > ordem de chegada
- Estimativa de tempo: "Se mantiver o ritmo atual, você termina a fila em ~3h"
- Próximo caso automático: ao finalizar um caso, já abre o próximo da fila
- "Focus mode": esconde sidebar e notificações, mostra apenas o caso atual

---

## 6. Acessibilidade

### 6.1 Requisitos Mínimos

**Conformidade alvo: WCAG 2.1 Nível AA**

| Requisito | Implementação |
|-----------|---------------|
| **Contraste** | Mínimo 4.5:1 para texto normal, 3:1 para texto grande. Todas as cores da paleta já atendem |
| **Navegação por teclado** | Todos os elementos interativos acessíveis via Tab. Focus visible com outline azul `#2563EB` 2px |
| **Screen reader** | ARIA labels em todos os componentes. Roles semânticos. Landmarks em cada página |
| **Formulários** | Labels associados, mensagens de erro vinculadas via aria-describedby, fieldsets com legend |
| **Imagens/ícones** | Alt text em imagens, aria-hidden em ícones decorativos, aria-label em ícones funcionais |
| **Motion** | Respeitar prefers-reduced-motion. Desabilitar animações do spinner e transições |
| **Zoom** | Suportar até 200% de zoom sem perda de funcionalidade ou sobreposição |
| **Links e botões** | Texto descritivo (nunca "clique aqui"). Área de toque mínima 44x44px |

### 6.2 Tipografia para Documentos Jurídicos

Documentos juridicos exigem leitura prolongada. A legibilidade é fundamental.

| Contexto | Tamanho Mínimo | Recomendado | Justificativa |
|----------|----------------|-------------|---------------|
| Texto de petição no editor | 14px | 15-16px | Leitura prolongada, equivalente a 12pt impresso |
| Texto de petição no preview PDF | 16px | 18px | Simulação de documento impresso |
| Dados extraídos (revisão) | 14px | 14px | Campos curtos, leitura rápida |
| Labels de formulário | 12px | 13px | Texto curto, auxiliar |
| Tabelas de dados | 13px | 14px | Densidade de informação |
| Valores monetários | 14px | 16px (mono) | Destaque necessário, evitar erros de leitura |
| CPF/CNPJ | 14px | 14px (mono) | Distinção clara entre dígitos |

**Recomendações adicionais:**
- Linha de leitura máxima de 80 caracteres no editor de petição (max-width: 720px no corpo do texto)
- Espaçamento entre linhas de 1.8 para textos juridicos longos
- Opção de aumentar fonte no editor (Ctrl + / Ctrl -) independente do zoom do navegador
- Fundo creme sutil (`#FFFEF7`) no editor de petição para reduzir fadiga ocular (opcional, toggle)

---

## 7. Priorização de Telas para MVP

### 7.1 Matriz de Priorização

**Critérios:**
- **Valor:** Quanto essa tela contribui para o fluxo principal de geração de petições
- **Frequência:** Quantas vezes por dia o usuário acessa essa tela
- **Complexidade:** Esforço de desenvolvimento

| # | Tela | Valor | Frequência | Complexidade | Prioridade |
|---|------|-------|------------|--------------|------------|
| 1 | Upload/Intake | Essencial | Alta | Média | **P0 - MVP** |
| 2 | Revisão de Extração IA | Essencial | Muito Alta | Alta | **P0 - MVP** |
| 3 | Validação (checklist) | Essencial | Muito Alta | Média | **P0 - MVP** |
| 4 | Geração de Petição | Essencial | Alta | Alta | **P0 - MVP** |
| 5 | Lista de Casos | Essencial | Muito Alta | Média | **P0 - MVP** |
| 6 | Detalhe do Caso | Essencial | Muito Alta | Média | **P0 - MVP** |
| 7 | Dashboard | Alta | Alta | Média | **P0 - MVP** |
| 8 | Login/Auth | Essencial | Baixa | Baixa | **P0 - MVP** |
| 9 | Pipeline Kanban | Alta | Alta | Média | **P1 - v1.1** |
| 10 | Revisão Final | Alta | Alta | Média | **P1 - v1.1** |
| 11 | Cálculo | Alta | Alta | Alta | **P1 - v1.1** |
| 12 | Central de Exceções | Média | Média | Média | **P1 - v1.1** |
| 13 | Fila de Trabalho | Média | Alta | Baixa | **P1 - v1.1** |
| 14 | Config: Templates | Média | Baixa | Alta | **P2 - v1.2** |
| 15 | Config: Fórum/Comarcas | Média | Baixa | Baixa | **P2 - v1.2** |
| 16 | Config: Parâmetros de Cálculo | Média | Baixa | Média | **P2 - v1.2** |
| 17 | Admin: Usuários | Média | Baixa | Média | **P2 - v1.2** |
| 18 | Admin: Organização | Baixa | Muito Baixa | Baixa | **P2 - v1.2** |
| 19 | Relatórios | Média | Média | Alta | **P3 - v2.0** |
| 20 | Audit Log | Baixa | Muito Baixa | Média | **P3 - v2.0** |
| 21 | Regras de Classificação | Baixa | Muito Baixa | Média | **P3 - v2.0** |

### 7.2 Escopo por Release

**P0 - MVP (8 telas):**
O mínimo para um advogado fazer upload de documentos, revisar dados extraídos, validar, gerar petição e acompanhar status dos casos. Templates e comarcas são pré-configurados (seed data).

```
Login → Dashboard → Upload → Extração IA → Validação → Petição → Lista/Detalhe
```

**P1 - v1.1 (5 telas):**
Pipeline visual, fluxo completo com cálculo e revisão do coordenador, tratamento de exceções.

```
+ Pipeline Kanban, Revisão Final, Cálculo, Exceções, Fila de Trabalho
```

**P2 - v1.2 (4 telas):**
Self-service de configuração. O escritório consegue gerenciar templates, comarcas e usuários sem suporte.

```
+ Templates, Fórum, Parâmetros, Usuários, Organização
```

**P3 - v2.0 (3 telas):**
Intelligence layer. Relatórios gerenciais, auditoria, classificação automática avançada.

```
+ Relatórios, Audit Log, Regras de Classificação
```

### 7.3 MVP: Simplificações Aceitáveis

Para acelerar o MVP sem comprometer a proposta de valor:

| Funcionalidade Completa | Simplificação no MVP |
|-------------------------|----------------------|
| Kanban com drag-and-drop | Lista de casos com filtro por status |
| Editor de petição rico | Textarea com preview PDF (sem edição inline de variáveis) |
| Templates CRUD | 3-5 templates pré-carregados, sem edição pelo usuário |
| Multi-cooperativa | Uma cooperativa por tenant, sem seletor |
| Relatórios avançados | Contadores simples no Dashboard |
| Notificações push | Toasts + badges na sidebar |
| Upload em lote | Upload de um caso por vez |
| Cálculo integrado | Cálculo manual (planilha ou input de valores) |
| Roles granulares | 2 roles: Operador e Admin |
| Busca full-text | Busca por número do caso, nome do devedor, CPF |

---

## 8. Recomendações Adicionais

### 8.1 Stack de UI Sugerida

| Camada | Tecnologia | Justificativa |
|--------|------------|---------------|
| Framework | Next.js (App Router) | SSR para SEO de login, RSC para performance, API routes |
| UI Library | shadcn/ui + Radix | Componentes acessíveis, customizáveis, sem vendor lock-in |
| Styling | Tailwind CSS | Produtividade, design tokens via config, consistência |
| State | Zustand ou React Context | Simplicidade para MVP, sem boilerplate excessivo |
| Forms | React Hook Form + Zod | Validação tipada, performance, integração com shadcn |
| Tables | TanStack Table | Sorting, filtering, pagination, virtual scroll para 500+ itens |
| PDF Viewer | react-pdf ou PSPDFKit | Visualização de documentos, highlight de trechos |
| Rich Text | Tiptap | Editor extensível para petições, suporte a variáveis |
| Charts | Recharts | Gráficos simples para Dashboard |
| Icons | Lucide React | Consistente, leve, boa cobertura |
| DnD (v1.1) | dnd-kit | Kanban drag-and-drop, acessível |

### 8.2 Performance para Alto Volume

Com 500+ casos, a interface precisa de otimizações específicas:

- **Virtualização de listas:** TanStack Virtual para renderizar apenas linhas visíveis na tabela de casos
- **Paginação server-side:** Nunca carregar todos os 500 casos no frontend. Paginar com cursor-based pagination
- **Debounce em buscas:** 300ms de debounce no campo de busca para evitar queries excessivas
- **Skeleton loading:** Skeletons em vez de spinners para todas as cargas de dados (percepção de velocidade)
- **Optimistic updates:** Ao aprovar um campo ou avançar etapa, atualizar UI imediatamente e sincronizar em background
- **Cache de dados:** SWR ou TanStack Query para cache inteligente e revalidação em background
- **Prefetch:** Ao hover sobre um caso na lista, prefetch dos dados do caso para carregamento instantâneo ao clicar

### 8.3 Onboarding do Usuário

Para um público não-técnico, o primeiro contato com o sistema é crítico:

1. **Tour guiado:** No primeiro login, tour interativo de 5 passos mostrando Dashboard, Upload, Revisão, Petição, Pipeline
2. **Caso demo:** Um caso pré-carregado ("Caso Exemplo") que o usuário pode percorrer sem consequências
3. **Tooltips contextuais:** Nos primeiros 7 dias, tooltips explicativos em features avançadas
4. **Vídeos curtos:** Links para vídeos de 60s em cada tela complexa ("Como revisar dados da IA")
5. **Central de ajuda:** Atalho `?` ou botão no canto inferior direito com FAQ contextual

---

## Resumo Executivo

O Carolina é um sistema de automação jurídica que precisa equilibrar **eficiência de alto volume** com **precisão jurídica**. As decisões de UX foram guiadas por três princípios:

1. **Confiança Progressiva na IA:** O advogado precisa confiar no que a IA faz bem e focar atenção onde a IA tem dúvidas. O indicador de confiança por campo é o coração da experiência.

2. **Exceções como Desvios, Não Bloqueios:** Com 500+ casos, um erro em um caso nunca deve parar os outros 499. O sistema de exceções é assíncrono e paralelo ao fluxo principal.

3. **Macro para Micro:** O coordenador precisa ver o pipeline inteiro. O operador precisa ver apenas seu próximo caso. O Dashboard serve ambos com visualizações adaptadas ao papel.

O MVP de 8 telas cobre o fluxo completo de upload-a-petição, priorizando as interações de maior valor (revisão de extração IA e geração de petição) e adiando funcionalidades de configuração e relatórios para releases subsequentes.
