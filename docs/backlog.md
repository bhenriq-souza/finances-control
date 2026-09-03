# Backlog

Fila de trabalho de alto nível, espelhada como issues no GitHub (FC-* neste repo, FCB-* no `finances-control-backend`). Formato: **What** (entregável) / **Where** (repo/caminho) / **Done when** (critério objetivo).

Quando o kit agentic estiver instalado no backend (FCB-001), as tarefas de código passam a seguir o formato `T-<spec>-<nn>` vinculado a specs, no `docs/backlog.md` daquele repo.

## Fase 0 — Fundações

- [ ] **FC-001 — Decidir ADR-0001 (frontend)**
  - What: avaliar candidatos e registrar decisão de stack do frontend
  - Where: `docs/adr/ADR-0001-frontend.md`
  - Done when: ADR com status `accepted` e alternativas registradas
- [x] **FC-002 — Decidir ADR-0003 (estilo arquitetural) e ADR-0005 (queue)** — feito: monolito modular com fronteiras verificadas por gate; eventos de domínio in-process, `pg-boss` para trabalho assíncrono, broker dedicado adiado com gatilhos explícitos
- [ ] **FC-003 — Aprovar ADR-0006 (auth)**
  - What: revisar proposta Firebase Auth e aprovar ou substituir
  - Where: `docs/adr/ADR-0006-auth.md`
  - Done when: status `accepted` (ou novo ADR superseding)
- [ ] **FC-005 — Decidir ADR-0007 (representação monetária)**
  - What: registrar tipo de coluna no PostgreSQL, tipo na aplicação e política de arredondamento para valores monetários
  - Where: `docs/adr/ADR-0007-monetary-representation.md`
  - Done when: ADR com status `accepted` e alternativas registradas
  - Why: nenhum documento do projeto decide isso hoje; a planilha legada acumula resíduo de ponto flutuante em saldo (ver [análise](legacy-spreadsheet-analysis.md#37-falta-decidir-a-representação-monetária))
- [x] **FC-004 — Criar board Projects v2** — feito: [Finances Control](https://github.com/users/bhenriq-souza/projects/2), 17 issues em Todo
- [x] **FCB-001 — Seed do kit agentic-driven no backend**
  - What: `AGENTS.md`, `CLAUDE.md` stub, `specs/0000-spec-process.md`, `specs/00xx-development-workflow.md`, skills `.claude/skills/{new-spec,implement-task,check,finish-task}`, `docs/backlog.md`, PR template, CODEOWNERS; branch protection com ativação faseada do required check
  - Where: `finances-control-backend` (fonte: `~/code/Personal/langgraph-agents`)
  - Done when: kit commitado, branch protection ativa em `develop`, PR canário aberto e mergeado validando o fluxo

## Fase 1 — Walking skeleton

- [x] **FCB-002 — Scaffold do app** (padrão `ts-express-app`: Express 5, tsyringe, TypeORM, zod, swagger, pacotes `@bhs-dev`; endpoint `/health`; estrutura de módulos e gate de fronteiras conforme ADR-0003)
- [x] **FCB-003 — Registrar repo no WIF do GCP** (tfvars `github_allowed_repositories` no `homelab-infra` + `terraform apply`; secrets `GCP_WIF_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `GITOPS_DEPLOY_KEY` no repo — deploy key em vez de PAT, por escopo menor e sem expiração)
- [x] **FCB-004 — CI/CD: caller workflow** (Dockerfile + caller do reusable `docker-build-push.yaml`; push em `develop` publica imagem `sha-*` no Artifact Registry)
- [x] **FCB-005 — Manifests no homelab-gitops** (deployment com label `homelab.io/database-access: postgresql`, service, ingress `ingressClassName: traefik` em `finances.dev.homelab.local`, ExternalSecret; registrar no kustomization de dev)
- [ ] **FCB-006 — Database dedicado + migrations** (criar DB `finances_dev` no Postgres do cluster, secret de conexão no GCP Secret Manager, TypeORM migrations rodando no deploy)

## Fase 2 — Domínio (specs formais no backend)

- [ ] **FCB-007 — Spec + implementação F001**: usuários e autenticação (Firebase/Google, RBAC Admin/Biller/Viewer)
- [ ] **FCB-008 — Spec + implementação F002**: bancos, contas bancárias e cartões de crédito
- [ ] **FCB-009 — Spec + implementação F003**: despesas (fixas/variáveis/parceladas, status, reflexo em saldo/limite)
- [ ] **FCB-010 — Spec + implementação F004**: faturas de cartão de crédito
- [ ] **FCB-011 — Spec + implementação F005**: receitas
- [ ] **FCB-012 — Saldo previsto e relatórios**
- [ ] **FCB-014 — Dispatcher de eventos de domínio in-process** (interface na camada `platform`, dispatch pós-commit, preparada para outbox — ADR-0005; precede FCB-009)
- [ ] **FCB-013 — Importação CSV** (bancos/contas/cartões, despesas, receitas)
- [ ] **FCB-015 — Jobs assíncronos e agendados com `pg-boss`** (worker de importação, Aberto→Vencido, fechamento de fatura, recorrência mensal — ADR-0005)
