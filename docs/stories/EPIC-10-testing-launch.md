# EPIC-10: Testing + Launch

**Produto:** Carolina
**Estimativa:** 1.5 semanas
**Prioridade:** P0
**Status:** Ready

---

## Objetivo

Garantir qualidade, seguranca e performance para o lancamento do MVP: testes automatizados, testes de seguranca, otimizacao de performance, deploy em producao e monitoramento.

## Escopo

### Inclui
- Testes unitarios (cobertura >= 80% em modulos criticos)
- Testes de integracao (fluxos criticos end-to-end)
- Testes E2E (fluxo completo upload-a-peticao)
- Testes de seguranca (RLS isolation, OWASP top 10)
- Testes de performance (load testing basico)
- Deploy em producao (Vercel + Supabase Cloud + Railway)
- Configuracao de monitoramento (Sentry)
- Runbook de operacoes
- Documentacao de API (OpenAPI/Swagger basico)

### Exclui
- Testes de carga em escala (v1.5)
- Penetration testing profissional (v1.5)
- Documentacao completa de usuario (v1.5)

## Requisitos Nao-Funcionais Mapeados

| NFR | Descricao |
|-----|-----------|
| NFR-001 | Tempo de resposta < 2s (P95) |
| NFR-002 | OCR < 60s para 10 paginas |
| NFR-003 | Peticao gerada em < 30s |
| NFR-012 | Prevencao contra ataques comuns |
| NFR-019 | Uptime 99.5% |
| NFR-021 | Resiliencia a falhas (retry, backoff) |
| NFR-024 | Cobertura de testes >= 80% |
| NFR-025 | CI/CD completo |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-01 a EPIC-09 (todo o sistema implementado) |

## Criterios de Aceite do Epic

- [ ] Cobertura de testes >= 80% nos modulos: calculation, validation, workflow
- [ ] Testes de integracao para: login > upload > extracao > validacao > calculo > peticao
- [ ] Teste E2E completo (Playwright) do fluxo principal
- [ ] Teste de isolamento RLS (tenant A nao ve dados de tenant B)
- [ ] Nenhuma vulnerabilidade critica (SQL injection, XSS, CSRF)
- [ ] Tempo de resposta < 2s (P95) medido com k6 ou similar
- [ ] Deploy em producao funcional e acessivel
- [ ] Sentry configurado capturando erros
- [ ] Dominio configurado (HTTPS)
- [ ] Backup automatico configurado no Supabase
- [ ] Runbook documentado (deploy, rollback, troubleshooting)

## Stories Sugeridas

1. **10.1** Testes unitarios dos modulos criticos
2. **10.2** Testes de integracao (fluxo end-to-end)
3. **10.3** Testes E2E com Playwright
4. **10.4** Testes de seguranca (RLS, OWASP)
5. **10.5** Deploy em producao (Vercel + Supabase + Railway)
6. **10.6** Monitoramento + runbook + documentacao

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
