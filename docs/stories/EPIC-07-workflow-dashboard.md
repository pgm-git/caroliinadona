# EPIC-07: Workflow + Dashboard

**Produto:** Carolina
**Estimativa:** 1.5 semanas
**Prioridade:** P0
**Status:** Ready

---

## Objetivo

Implementar o pipeline de workflow (maquina de estados com 8+ etapas), dashboard operacional em tempo real, atribuicao de responsaveis, notificacoes in-app e historico completo de atividades.

## Escopo

### Inclui
- Pipeline com etapas: Entrada > Processamento > Validacao > Classificacao > Calculo > Geracao > Revisao > Protocolado
- Maquina de estados com transicoes validas
- Atribuicao manual de responsaveis por caso
- Notificacoes in-app (toasts, badges, centro de notificacoes)
- Historico completo de atividades por caso
- Retorno de etapa com justificativa
- Dashboard operacional (contadores, pipeline, fila pessoal)
- Metricas basicas de produtividade
- Filtros e segmentacao
- Exportacao de relatorios basicos

### Exclui
- SLAs configuraveis (v1.5)
- Filas por perfil automaticas (v1.5)
- Acoes em lote (v1.5)
- Kanban drag-and-drop (v1.1 — lista com filtros no MVP)
- Comentarios por processo (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-060 | Pipeline com etapas definidas | Completo |
| FR-061 | Atribuicao de responsaveis | Parcial (manual) |
| FR-062 | Notificacoes em tempo real | Parcial (in-app) |
| FR-067 | Historico completo de atividades | Completo |
| FR-070 | Reprocessamento e retorno de etapa | Completo |
| FR-071 | Dashboard operacional em tempo real | Completo |
| FR-072 | Metricas de produtividade | Completo (basico) |
| FR-075 | Filtros e segmentacao | Completo |
| FR-077 | Exportacao de relatorios | Completo (PDF, CSV) |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-021 | Dashboard com status de todos os processos |
| US-022 | Fila de trabalho priorizada |
| US-024 | Alertas quando SLAs estiverem proximos de estourar |
| US-025 | Relatorios de produtividade por advogado |
| US-026 | Relatorios por cooperativa |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-01 (infra, auth, layout) |
| **Depende de** | EPIC-06 (peticao gerada para transitar no workflow) |
| **Bloqueia** | EPIC-08 (excecoes integram com workflow) |

## Criterios de Aceite do Epic

- [ ] Pipeline com 8+ etapas funcionando
- [ ] Transicoes de status validadas (maquina de estados)
- [ ] Status history registrado automaticamente
- [ ] Atribuicao manual de advogado/estagiario por caso
- [ ] Notificacoes in-app (toasts + badges na sidebar)
- [ ] Historico completo de atividades visivel no detalhe do caso
- [ ] Retorno de etapa com justificativa obrigatoria
- [ ] Dashboard com: casos por status, volume, metricas de produtividade
- [ ] Filtros por cooperativa, responsavel, tipo, status, periodo
- [ ] Exportacao de relatorios basicos em PDF e CSV
- [ ] RPC `advance_case_status()` validando transicoes

## Stories Sugeridas

1. **7.1** Maquina de estados do workflow (transicoes, validacoes)
2. **7.2** Tela de lista de casos (tabela, filtros, busca)
3. **7.3** Tela de detalhe do caso (timeline, dados, documentos)
4. **7.4** Dashboard operacional (metricas, contadores, graficos)
5. **7.5** Sistema de notificacoes in-app
6. **7.6** Relatorios basicos (produtividade, por cooperativa)

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
