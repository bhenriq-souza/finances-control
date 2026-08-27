# ADR-0002 — Stack e repositório do back-end

- Status: **accepted**
- Data: 2026-08-27

## Context

O registro original (ADR02) definia Node.js + TypeScript com OpenSpecs. Existia um backend iniciado em 2025 (`bhenriq-souza/control-backend`: Express 5, tsyringe, Firebase Auth, **MongoDB**), parado desde então. Desde lá o usuário estabeleceu um padrão mais novo no template `ts-express-app` (TypeORM, zod, swagger/OpenAPI, tsyringe) e publicou os pacotes `@bhs-dev/typescript-common-{types,errors,env}` no npm. O homelab oferece PostgreSQL 16 pronto (ADR-0004).

## Decision

- O back-end será desenvolvido em **Node.js + TypeScript**, Express 5, com contrato **OpenAPI** (OpenSpecs).
- Será criado um **repositório novo: `finances-control-backend`**, semeado a partir do padrão `ts-express-app`, consumindo os pacotes `@bhs-dev/*`.
- Injeção de dependência com tsyringe; validação com zod; ORM TypeORM (ver ADR-0004).
- O `control-backend` fica **arquivado como referência**: dele serão portados o fluxo de Firebase Auth e os middlewares (correlationId, logging, timing) que ainda não existem como pacotes `@bhs-dev`.

## Consequences

- Alinhamento total com os pacotes publicados e com o banco disponível no cluster.
- O código de users/expenses do `control-backend` não é reaproveitado diretamente (era acoplado ao MongoDB); as features renascem via specs.
- Os pacotes `@bhs-dev` faltantes (`logger`, `middlewares`, `http`, `context`, `express`) podem ser implementados sob demanda conforme o backend precisar.

## Alternatives considered

- **Retomar `control-backend` como está (MongoDB)**: exigiria adicionar MongoDB ao cluster e abandonaria o padrão novo; modelo de dados do produto é fortemente relacional.
- **Retomar `control-backend` migrando para Postgres**: manteria o histórico git, mas o retrabalho dentro do repo antigo seria maior que semear do template novo.
