# ADR-0005 — Mensageria/filas

- Status: **open** (decisão pendente)

## Context

O registro original (ADR05) ficou vazio. Candidatos a uso assíncrono no domínio: importação de CSV, geração de parcelas futuras, transição automática de status (ex.: Aberto → Vencido), fechamento de faturas.

## Considerações

- Depende do ADR-0003: num monolito modular, jobs internos (cron no próprio app ou CronJob do K8s) podem cobrir os casos acima sem um broker.
- Se um broker se justificar, avaliar opções leves compatíveis com o cluster single-node (ex.: BullMQ + Redis).

## Decision

_A definir — tarefa FC-002 no [backlog](../backlog.md). Recomendação inicial: adiar broker até haver caso de uso que jobs simples não cubram._
