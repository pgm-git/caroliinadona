# EPIC-05: Calculation Engine

**Produto:** Carolina
**Estimativa:** 1.5 semanas
**Prioridade:** P0
**Status:** Ready

---

## Objetivo

Implementar o motor de calculo financeiro: atualizacao monetaria com multiplos indices, juros simples e compostos, honorarios, planilha judicial padronizada e integracao com APIs do Banco Central.

## Escopo

### Inclui
- Calculo de valor atualizado da divida (principal + correcao + juros + multa)
- Suporte a indices: INPC, IGPM, IPCA, CDI, TR, SELIC
- Juros simples e compostos conforme contrato
- Calculo de honorarios advocaticios
- Geracao de planilha judicial (breakdown mensal)
- Validacao de limites legais (anatocismo, multa > 2%)
- Atualizacao automatica de indices via API BCB
- Memoria de calculo auditavel

### Exclui
- Custas processuais por comarca (v1.5)
- Simulacao de cenarios com datas diferentes (v1.5)

## Requisitos Funcionais Mapeados

| FR | Descricao | Cobertura |
|----|-----------|-----------|
| FR-039 | Calculo de valor atualizado da divida | Completo |
| FR-040 | Suporte a multiplos indices de correcao | Completo |
| FR-041 | Calculo de juros compostos e simples | Completo |
| FR-042 | Calculo de honorarios advocaticios | Completo |
| FR-044 | Geracao de planilha de calculo | Completo |
| FR-046 | Validacao de limites legais | Completo |
| FR-047 | Atualizacao automatica de indices | Completo |
| FR-048 | Memoria de calculo auditavel | Completo |

## User Stories Relacionadas

| US | Story |
|----|-------|
| US-013 | Calculo automatico do valor atualizado |
| US-014 | Planilha de calculo no formato judicial |
| US-015 | Regras de calculo especificas por cooperativa |

## Dependencias

| Tipo | Detalhe |
|------|---------|
| **Depende de** | EPIC-04 (classificacao do caso) |
| **Bloqueia** | EPIC-06 (peticao precisa do calculo) |
| **Externa** | API BCB (https://api.bcb.gov.br) para indices |

## Criterios de Aceite do Epic

- [ ] Calculo correto com correcao monetaria mes a mes
- [ ] Todos os 6 indices suportados (INPC, IGPM, IPCA, CDI, TR, SELIC)
- [ ] Juros simples e compostos calculados corretamente
- [ ] Honorarios calculados (percentual configuravel por cooperativa)
- [ ] Planilha judicial com breakdown mensal exportavel em PDF/XLSX
- [ ] Alertas de limites legais (anatocismo, multa excessiva)
- [ ] Indices atualizados automaticamente via cron diario (BCB)
- [ ] Memoria de calculo persistida e vinculada ao caso
- [ ] Versionamento de calculos (novo calculo desativa anterior)
- [ ] Calculo validado contra exemplos reais com margem de erro < 0.01%

## Stories Sugeridas

1. **5.1** Cliente de indices BCB (fetch, cache, fallback)
2. **5.2** Motor de correcao monetaria (6 indices, mes a mes)
3. **5.3** Motor de juros (simples, compostos, moratorios)
4. **5.4** Calculo de honorarios + limites legais
5. **5.5** Geracao de planilha judicial (PDF/XLSX)
6. **5.6** UI de calculo (parametros, resultado, exportacao)

---

**Criado por:** @pm (Morgan)
**Data:** 2026-03-21
