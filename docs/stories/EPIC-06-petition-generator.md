# EPIC-06: Petition Generator

**Produto:** Carolina
**Estimativa:** 2 semanas
**Prioridade:** P0
**Status:** Ready

---

## Objetivo

Implementar o gerador de peticoes: templates parametrizados, preenchimento automatico com dados do caso, refinamento por IA (GPT-4o), editor integrado (Tiptap), exportacao em PDF/DOCX e versionamento.

## Escopo

### Inclui
- 3 templates MVP (Execucao CCB, Cobranca, Monitoria)
- Preenchimento automatico de dados extraidos/validados
- Geracao com IA (camada template + camada GPT-4o)
- Editor rich-text integrado (Tiptap)
- Exportacao em PDF e DOCX
- Versionamento de peticoes
- Validacao pre-exportacao (campos preenchidos, formatacao)
- Preview antes da exportacao

### Exclui
- Geracao com IA generativa completa (v1.5)
- Biblioteca de fundamentacao juridica (v1.5)
- Templates customizaveis pelo usuario (v1.5)
- Numeracao automatica de documentos (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-049 | Templates por tipo de acao | Completo (3 templates) |
| FR-050 | Preenchimento automatico de dados | Completo |
| FR-051 | Editor de texto integrado | Completo |
| FR-053 | Exportacao em multiplos formatos | Completo (PDF, DOCX) |
| FR-054 | Versionamento de peticoes | Completo |
| FR-057 | Validacao pre-exportacao | Completo |
| FR-059 | Preview antes de exportacao | Completo |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-017 | Peticao gerada automaticamente com dados preenchidos |
| US-018 | Editar peticao em editor integrado |
| US-020 | Criar e gerenciar templates de peticao |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-05 (calculo para valores na peticao) |
| **Depende de** | EPIC-04 (classificacao para selecao de template) |
| **Bloqueia** | EPIC-07 (workflow gerencia status da peticao) |
| **Externa** | OpenAI GPT-4o (refinamento textual) |

## Criterios de Aceite do Epic

- [ ] 3 templates funcionando (Execucao CCB, Cobranca, Monitoria)
- [ ] Dados preenchidos automaticamente (partes, valores, datas, foro)
- [ ] GPT-4o refinando fundamentacao juridica e coesao textual
- [ ] Editor Tiptap com formatacao juridica (margens, fonte, espacamento)
- [ ] Exportacao PDF fiel ao preview
- [ ] Exportacao DOCX editavel
- [ ] Versionamento (v1, v2, v3...) com historico
- [ ] Validacao pre-export impedindo peticao incompleta
- [ ] Preview renderizado antes da exportacao final
- [ ] Variaveis preenchidas destacadas visualmente no editor

## Stories Sugeridas

1. **6.1** Sistema de templates (modelo, variaveis, renderizacao)
2. **6.2** Preenchimento automatico com dados do caso
3. **6.3** Integracao GPT-4o para refinamento de peticao
4. **6.4** Editor Tiptap com formatacao juridica
5. **6.5** Geracao e exportacao PDF (react-pdf / puppeteer)
6. **6.6** Exportacao DOCX + versionamento
7. **6.7** Validacao pre-exportacao e preview

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
