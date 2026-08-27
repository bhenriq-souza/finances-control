# ADR-0004 — Banco de dados: PostgreSQL + TypeORM

- Status: **accepted**
- Data: 2026-08-27

## Context

O registro original (ADR04) ficou vazio. O modelo de dados do produto é fortemente relacional (bancos ↔ contas ↔ cartões ↔ faturas ↔ despesas parceladas, com integridade referencial e agregações de saldo). O cluster homelab já roda **PostgreSQL 16** (imagem pgvector/pg16, StatefulSet em `dev-apps`, secret `postgresql-auth` via ESO, NetworkPolicy restringindo a porta 5432). O padrão `ts-express-app` usa TypeORM.

## Decision

- O banco de dados será **PostgreSQL 16**, usando a instância existente do cluster homelab.
- ORM: **TypeORM**, com migrations versionadas no repositório do backend.
- A app backend deve carregar a label de pod `homelab.io/database-access: postgresql` (exigência da NetworkPolicy).
- Deve ser criado um **database dedicado** para a aplicação (ex.: `finances_dev`) — hoje o cluster tem apenas o DB `homelab_ai`; a estratégia de criação/segregação será definida na tarefa FCB-006.

## Consequences

- Zero infraestrutura nova; secrets e acesso já resolvidos pelo padrão do cluster.
- Compartilhar a instância com outros projetos (Tech Lead Joe) exige disciplina de databases separados e atenção a recursos do single-node.
- Backup/restore do Postgres ainda é pendência da infra (diretriz `pg_dump` sem CronJob implementado) — risco aceito em dev, deve ser resolvido antes de dados reais em prd.

## Alternatives considered

- **MongoDB** (caminho do `control-backend` antigo): não hospedado no cluster; modelo relacional do domínio se encaixa mal em documentos.
- **SQLite**: insuficiente para o modelo multi-usuário via web e para o padrão de deploy no cluster.
