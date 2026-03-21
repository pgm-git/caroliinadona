# EPIC-04: Validation + Classification

**Produto:** Carolina
**Estimativa:** 1.5 semanas
**Prioridade:** P0
**Status:** Ready

---

## Objetivo

Implementar o motor de validacao (checklist automatico, completude, prescricao, CPF/CNPJ) e o motor de classificacao (tipo de acao, complexidade, litisconsorcio) com sinalizacao visual (semaforo).

## Escopo

### Inclui
- Checklist automatico de documentos por tipo de acao
- Verificacao de completude de dados obrigatorios
- Validacao algoritmica de CPF/CNPJ
- Calculo de prescricao com alertas
- Sinalizacao visual (semaforo verde/amarelo/vermelho)
- Bloqueio de avanco sem validacao
- Registro de validacao manual com auditoria
- Classificacao de tipo de acao judicial
- Classificacao de complexidade
- Identificacao de litisconsorcio
- Override manual com justificativa

### Exclui
- Determinacao automatica de competencia/foro (v1.5)
- Sugestao de pedidos acessorios (v1.5)
- Regras configuraveis de classificacao (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-021 | Checklist automatico de documentos | Completo |
| FR-022 | Checklist de execucao de titulo | Completo |
| FR-023 | Verificacao de completude de dados | Completo |
| FR-024 | Validacao de CPF/CNPJ | Completo |
| FR-025 | Verificacao de prescricao | Completo |
| FR-026 | Sinalizacao visual (semaforo) | Completo |
| FR-029 | Registro de validacao manual | Completo |
| FR-030 | Bloqueio de avanco sem validacao | Completo |
| FR-031 | Classificacao de tipo de acao judicial | Completo |
| FR-032 | Classificacao de complexidade | Completo |
| FR-034 | Identificacao de litisconsorcio | Completo |
| FR-038 | Override manual com justificativa | Completo |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-009 | Ver claramente o que esta faltando (semaforo) |
| US-010 | Alerta sobre prescricao iminente |
| US-011 | Sugestao automatica de tipo de acao |
| US-012 | Alterar classificacao com justificativa |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-03 (dados extraidos) |
| **Bloqueia** | EPIC-05 (calculo depende de classificacao) |

## Criterios de Aceite do Epic

- [ ] Checklist automatico validando documentos por tipo de acao
- [ ] CPF/CNPJ validados algoritmicamente
- [ ] Prescricao calculada com alerta em < 90 dias
- [ ] Semaforo verde/amarelo/vermelho em cada campo
- [ ] Caso bloqueado quando tem pendencia vermelha
- [ ] Validacao manual com registro de quem/quando/justificativa
- [ ] Tipo de acao classificado (Execucao, Cobranca, Monitoria)
- [ ] Complexidade classificada (Simples, Medio, Complexo)
- [ ] Litisconsorcio identificado em casos com multiplos devedores
- [ ] Override de classificacao com justificativa obrigatoria

## Stories Sugeridas

1. **4.1** Motor de validacao (regras de completude, CPF/CNPJ)
2. **4.2** Calculo de prescricao e alertas
3. **4.3** UI de checklist com semaforo e bloqueio
4. **4.4** Motor de classificacao (tipo de acao, complexidade)
5. **4.5** Identificacao de litisconsorcio + override manual

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
