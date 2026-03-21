# EPIC-02: Intake + Storage

**Produto:** Carolina
**Estimativa:** 1 semana
**Prioridade:** P0 — Critico
**Status:** Ready

---

## Objetivo

Implementar o modulo de entrada de documentos: upload de arquivos, criacao de casos, armazenamento no Supabase Storage e fila de processamento.

## Escopo

### Inclui
- Upload de documentos (individual e lote) via drag-and-drop
- Pre-visualizacao de documentos PDF no browser
- Criacao de caso a partir de documentos enviados
- Armazenamento em Supabase Storage com path padronizado
- Fila de entrada com status (Recebido, Em Processamento, Processado, Erro)
- Registro de origem e rastreabilidade
- Validacao de formato na entrada
- Organizacao em lotes

### Exclui
- OCR e extracao de dados (EPIC-03)
- Integracao com e-mail (v1.5)
- Integracao via API com cooperativas (v1.5)
- Deteccao de duplicatas (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-001 | Upload manual de documentos | Completo |
| FR-002 | Upload via drag-and-drop | Completo |
| FR-005 | Pre-visualizacao de documentos | Completo |
| FR-006 | Organizacao em lotes | Completo |
| FR-008 | Registro de origem e rastreabilidade | Completo |
| FR-009 | Validacao de formato na entrada | Completo |
| FR-010 | Fila de entrada com status | Completo |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-001 | Upload de multiplos documentos em lote |
| US-003 | Visualizar documento original ao lado dos dados |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-01 (auth, RLS, storage, layout) |
| **Bloqueia** | EPIC-03 (document processing precisa de documentos) |

## Criterios de Aceite do Epic

- [ ] Upload individual e em lote (ate 50 arquivos) funcionando
- [ ] Drag-and-drop com barra de progresso
- [ ] Rejeicao de arquivos corrompidos/invalidos com mensagem clara
- [ ] Documentos armazenados em `case-documents/{org_id}/{case_id}/`
- [ ] Pre-visualizacao de PDF no browser (react-pdf)
- [ ] Caso criado automaticamente ao enviar documentos
- [ ] Fila de entrada visivel com status em tempo real
- [ ] Metadata registrada: canal, timestamp, usuario, cooperativa
- [ ] RLS garantindo isolamento de documentos entre tenants

## Stories Sugeridas

1. **2.1** Componente de upload (drag-and-drop, validacao, progresso)
2. **2.2** Integracao com Supabase Storage (upload, path, policies)
3. **2.3** CRUD de casos (criar, listar, detalhe)
4. **2.4** Visualizador de PDF embutido (react-pdf)
5. **2.5** Fila de entrada com status e polling/realtime

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
