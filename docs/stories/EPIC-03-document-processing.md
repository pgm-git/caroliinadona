# EPIC-03: Document Processing

**Produto:** Carolina
**Estimativa:** 2 semanas
**Prioridade:** P0 — Critico
**Status:** Ready

---

## Objetivo

Implementar o pipeline de processamento de documentos: OCR via Google Document AI, extracao de dados estruturados com GPT-4o, identificacao de partes processuais, score de confianca e processamento assincrono via BullMQ.

## Escopo

### Inclui
- Integracao com Google Document AI (OCR)
- Extracao de dados estruturados com GPT-4o (campos da CCB, contratos)
- Identificacao e classificacao de partes processuais
- Classificacao automatica de tipo de titulo
- Score de confianca por campo extraido
- Tela de revisao lado-a-lado (documento + dados extraidos)
- Reprocessamento manual
- Fila assincrona (BullMQ worker)

### Exclui
- Deteccao de assinaturas (v1.5)
- Extracao de clausulas (v1.5)
- Aprendizado continuo / feedback loop (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-011 | OCR de documentos | Completo |
| FR-012 | Extracao de dados estruturados | Completo |
| FR-013 | Identificacao de partes processuais | Completo |
| FR-015 | Classificacao automatica de tipo de titulo | Completo |
| FR-017 | Score de confianca por campo | Completo |
| FR-018 | Reprocessamento manual | Completo |
| FR-020 | Processamento em fila assincrona | Completo |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-003 | Visualizar documento original ao lado dos dados extraidos |
| US-005 | IA extrair automaticamente os dados da CCB |
| US-006 | Ver score de confianca de cada campo extraido |
| US-007 | Corrigir dados extraidos incorretamente de forma inline |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-01 (filas BullMQ, infra) |
| **Depende de** | EPIC-02 (documentos no storage) |
| **Bloqueia** | EPIC-04 (validacao depende de dados extraidos) |

## Criterios de Aceite do Epic

- [ ] Google Document AI configurado e processando documentos
- [ ] GPT-4o extraindo campos estruturados de CCBs
- [ ] Partes processuais identificadas (devedor, avalista, credor)
- [ ] Tipo de titulo classificado com confianca >= 90%
- [ ] Score de confianca visivel por campo (verde/amarelo/vermelho)
- [ ] Tela de revisao com documento PDF lado-a-lado
- [ ] Edicao inline de campos extraidos
- [ ] Worker BullMQ processando documentos assincronamente
- [ ] Retry com backoff exponencial em falhas
- [ ] Dados persistidos em `extracted_data` com `confidence_score`

## Stories Sugeridas

1. **3.1** Integracao com Google Document AI (OCR client)
2. **3.2** Pipeline de extracao com GPT-4o (prompts por tipo de documento)
3. **3.3** Worker BullMQ para processamento assincrono
4. **3.4** Identificacao e classificacao de partes processuais
5. **3.5** Tela de revisao de extracao (side-by-side com confianca)
6. **3.6** Edicao inline de campos extraidos + reprocessamento

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
