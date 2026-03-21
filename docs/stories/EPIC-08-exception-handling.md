# EPIC-08: Exception Handling

**Produto:** Carolina
**Estimativa:** 1 semana
**Prioridade:** P1
**Status:** Ready

---

## Objetivo

Implementar o sistema de tratamento de excecoes: deteccao automatica de problemas no pipeline, fila de revisao humana, notificacoes, e integracao com o workflow para pausar/retomar casos.

## Escopo

### Inclui
- Deteccao automatica de excecoes (documento ilegivel, campo faltante, CPF invalido, valor divergente)
- Categorias de excecao com severidade (auto_resolve, needs_review, blocking)
- Central de excecoes (listagem, agrupamento, acoes)
- Notificacao ao responsavel quando excecao detectada
- Caso pausado na etapa atual ate resolucao
- Resolucao de excecoes com registro de quem/quando
- Trigger de unblock (caso retorna ao pipeline quando excecoes resolvidas)

### Exclui
- Acoes em lote para excecoes do mesmo tipo (v1.1)
- SLA visual para excecoes (v1.1)

## Requisitos Funcionais Relacionados

Os FRs de excecao estao distribuidos entre os modulos de validacao, processamento e workflow. Este epic implementa a **infraestrutura transversal** de excecoes que os outros modulos utilizam.

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-07 (workflow para pausar/retomar) |
| **Depende de** | EPIC-04 (validacao gera excecoes) |
| **Depende de** | EPIC-03 (processamento gera excecoes) |

## Criterios de Aceite do Epic

- [ ] Excecoes criadas automaticamente quando problemas detectados
- [ ] 12 tipos de excecao cobrindo todos os cenarios do pipeline
- [ ] Severidade atribuida automaticamente (auto_resolve, needs_review, blocking)
- [ ] Caso pausado quando excecao blocking ativa
- [ ] Central de excecoes listando todas as pendentes por tipo
- [ ] Notificacao enviada ao responsavel do caso
- [ ] Resolucao com registro de auditoria
- [ ] Trigger de unblock funcionando (caso retoma quando blocking resolvida)
- [ ] Excecoes de um caso nao afetam outros casos

## Stories Sugeridas

1. **8.1** Modelo de excecoes (tipos, severidade, lifecycle)
2. **8.2** Deteccao automatica de excecoes nos modulos
3. **8.3** Central de excecoes (UI de listagem e resolucao)
4. **8.4** Integracao com workflow (pausa, unblock, notificacao)

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
