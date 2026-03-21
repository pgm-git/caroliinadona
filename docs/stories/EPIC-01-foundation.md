# EPIC-01: Foundation

**Produto:** Carolina
**Estimativa:** 2 semanas
**Prioridade:** P0 — Critico (bloqueia todos os demais epicos)
**Status:** Ready

---

## Objetivo

Estabelecer a fundacao tecnica do projeto: projeto Next.js 15, autenticacao via Supabase Auth, multi-tenancy com RLS, schema base do banco de dados e infraestrutura de filas.

## Escopo

### Inclui
- Inicializacao do projeto Next.js 15 (App Router) com TypeScript
- Configuracao de Supabase (auth, database, storage)
- Implementacao de autenticacao (login, registro, logout, MFA)
- Multi-tenancy com Row Level Security (RLS)
- Execucao das migrations SQL (00001-00013)
- Setup de tRPC para API type-safe
- Configuracao de Drizzle ORM
- Setup de BullMQ + Redis (Upstash) para filas
- Design system base (shadcn/ui + Tailwind)
- Layout base (sidebar, header, routing)
- CI/CD basico (lint, typecheck, build)

### Exclui
- Logica de negocio dos modulos (intake, processamento, etc.)
- Integracao com APIs externas (Google Document AI, OpenAI)
- Dashboard funcional (apenas layout placeholder)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura neste Epic |
|----|-----------|---------------------|
| FR-079 | Gestao de usuarios e permissoes | Parcial — CRUD basico + RBAC |
| FR-080 | Multi-tenancy por escritorio | Completo — RLS + isolamento |
| FR-084 | Logs de auditoria do sistema | Parcial — infra de audit_log |

## Requisitos Nao-Funcionais Mapeados

| NFR | Descricao |
|-----|-----------|
| NFR-006 | Autenticacao (email/senha + MFA) |
| NFR-007 | Autorizacao (RBAC) |
| NFR-008 | Criptografia em transito (HTTPS/TLS) |
| NFR-011 | Isolamento de dados multi-tenant |
| NFR-017 | Interface 100% PT-BR |
| NFR-023 | Stack padronizada (Next.js + TypeScript + Supabase) |
| NFR-025 | CI/CD pipeline basico |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-027 | Gerenciar usuarios e perfis de acesso |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Bloqueia** | EPIC-02 a EPIC-10 (todos dependem da fundacao) |
| **Depende de** | Migrations SQL ja criadas em `supabase/migrations/` |
| **Depende de** | Schema documentado em `docs/architecture/SCHEMA.md` |

## Criterios de Aceite do Epic

- [ ] Projeto Next.js 15 rodando localmente (`npm run dev`)
- [ ] Supabase configurado e conectado (local ou cloud)
- [ ] Todas as 13 migrations aplicadas com sucesso
- [ ] Seed data carregado (comarcas + templates)
- [ ] Login/registro funcionando via Supabase Auth
- [ ] RLS ativo em todas as tabelas — teste de isolamento entre tenants
- [ ] tRPC configurado com router raiz e context de autenticacao
- [ ] Drizzle ORM com schema TypeScript gerado das migrations
- [ ] BullMQ conectado ao Redis com health check
- [ ] Layout base renderizando (sidebar + header + area de conteudo)
- [ ] shadcn/ui instalado com componentes base (Button, Input, Card, Table)
- [ ] Lint + typecheck passando no CI
- [ ] 4 roles funcionando: admin, coordinator, lawyer, intern

## Stories Sugeridas

1. **1.1** Setup projeto Next.js 15 + TypeScript + Tailwind + shadcn/ui
2. **1.2** Configurar Supabase (projeto, env vars, client)
3. **1.3** Aplicar migrations e seed data
4. **1.4** Implementar autenticacao (login, registro, logout)
5. **1.5** Implementar RBAC com middleware de autorizacao
6. **1.6** Configurar tRPC (router raiz, context, middleware auth)
7. **1.7** Configurar Drizzle ORM (schema, client, types)
8. **1.8** Setup BullMQ + Redis (Upstash)
9. **1.9** Layout base (sidebar, header, routing protegido)
10. **1.10** CI pipeline (lint, typecheck, build)

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
