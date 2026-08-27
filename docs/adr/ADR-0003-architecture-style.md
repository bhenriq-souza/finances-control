# ADR-0003 — Estilo arquitetural (monolito modular vs microservices)

- Status: **open** (decisão pendente)

## Context

O registro original (ADR03 "Microservices") ficou vazio. O cluster é single-node com recursos limitados; o time é uma pessoa + agentes de IA; o domínio (usuários, contas, despesas, faturas, receitas) é coeso.

## Considerações

- Um **monolito modular** (módulos por contexto: users, accounts, expenses, statements, earnings) minimiza overhead operacional no cluster single-node e simplifica o walking skeleton.
- A separação frontend/backend já é obrigatória pelo pipeline (1 app-name = 1 deployment).
- Microservices podem ser reavaliados se surgirem necessidades reais (ex.: worker de importação CSV, jobs de recorrência) — o ADR-0005 (queue) depende desta decisão.

## Decision

_A definir — tarefa FC-002 no [backlog](../backlog.md)._
