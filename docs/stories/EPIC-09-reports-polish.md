# EPIC-09: Reports + Polish

**Produto:** Carolina
**Estimativa:** 1 semana
**Prioridade:** P1
**Status:** Ready

---

## Objetivo

Completar relatorios avancados, metricas de qualidade da IA, cadastro de cooperativas, configuracao de regras de calculo e polish geral da UX.

## Escopo

### Inclui
- Metricas de qualidade da IA (acuracia OCR, classificacao)
- Relatorio por cooperativa (volume, status, valores)
- Cadastro de cooperativas (dados, regras, templates)
- Configuracao de regras de calculo por cooperativa
- Logs de auditoria do sistema (UI)
- Polish de UX: loading states, feedback visual, empty states
- Onboarding guiado (tour de primeiro acesso)
- Busca global de casos (por numero, nome, CPF)

### Exclui
- Relatorio financeiro (v1.5)
- Alertas configuraveis (v1.5)
- Gestao de templates pelo usuario (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-073 | Metricas de qualidade da IA | Completo |
| FR-074 | Relatorio por cooperativa | Completo |
| FR-081 | Cadastro de cooperativas | Completo |
| FR-083 | Configuracao de regras de calculo | Completo |
| FR-084 | Logs de auditoria do sistema | Completo (UI) |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-008 | Acompanhar acuracia da IA ao longo do tempo |
| US-026 | Relatorios por cooperativa |
| US-028 | Cadastrar cooperativas com regras especificas |
| US-029 | Logs de auditoria |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-07 (dashboard base para estender) |
| **Depende de** | EPIC-03 (dados de acuracia da IA) |

## Criterios de Aceite do Epic

- [ ] Dashboard de acuracia da IA (por campo, evolucao temporal)
- [ ] Relatorio por cooperativa exportavel em PDF
- [ ] CRUD de cooperativas com dados e regras
- [ ] Configuracao de indices/taxas por cooperativa
- [ ] UI de audit log com filtros e busca
- [ ] Loading states em todas as paginas
- [ ] Empty states informativos
- [ ] Feedback visual em todas as acoes
- [ ] Tour de onboarding no primeiro login
- [ ] Busca global funcional

## Stories Sugeridas

1. **9.1** Metricas de qualidade da IA (dashboard de acuracia)
2. **9.2** Relatorio por cooperativa (geracao + exportacao PDF)
3. **9.3** CRUD de cooperativas + regras de calculo
4. **9.4** UI de audit log
5. **9.5** UX polish (loading, empty states, feedback, onboarding)

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
