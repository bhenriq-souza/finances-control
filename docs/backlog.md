# Backlog

Fila de trabalho de alto nível, espelhada como issues no GitHub (FC-* neste repo, FCB-* no `finances-control-backend`). Formato: **What** (entregável) / **Where** (repo/caminho) / **Done when** (critério objetivo).

Quando o kit agentic estiver instalado no backend (FCB-001), as tarefas de código passam a seguir o formato `T-<spec>-<nn>` vinculado a specs, no `docs/backlog.md` daquele repo.

## Fase 0 — Fundações

- [x] **FC-001 — Decidir ADR-0001 (frontend)** — feito: React 19 + Vite, SPA pura; TanStack Router/Query, react-hook-form + zod, cliente gerado do OpenAPI, Tailwind + shadcn/ui; imagem estática nginx com config em runtime; mesma origem do backend via `/api`
- [x] **FC-002 — Decidir ADR-0003 (estilo arquitetural) e ADR-0005 (queue)** — feito: monolito modular com fronteiras verificadas por gate; eventos de domínio in-process, `pg-boss` para trabalho assíncrono, broker dedicado adiado com gatilhos explícitos
- [x] **FC-003 — Aprovar ADR-0006 (auth)** — feito: Firebase Auth mantido, no projeto já existente; backend valida o ID token e lê o papel do banco a cada requisição; usuário novo nasce sem perfil; primeiro Admin por email de bootstrap em secret
- [x] **FC-005 — Decidir ADR-0007 (representação monetária)** — feito: `numeric(14,2)` no banco, inteiro de centavos na aplicação e na API, resto do rateio na primeira parcela, half-up simétrico, BRL implícito, parser dedicado para `1.234,56`, formatação só na exibição
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
- [ ] **FC-007 — Piloto de Agent Teams na revisão da spec 0012 (expenses)** — [#13](https://github.com/bhenriq-souza/finances-control/issues/13)
  - What: antes de aprovar a spec `0012`, revisá-la com um time de três teammates que debatem entre si — domínio vs. planilha legada; ADR-0003/0005/0007 e invariantes financeiras; testabilidade dos ACs — com o lead consolidando. Preparação: flag experimental habilitada, um `git worktree` por teammate validado, hook `TaskCompleted` rodando `npm run check`, seção de teammates no `AGENTS.md` do backend
  - Where: sessão no `finances-control-backend`; achados no PR da spec `0012`; regra de teammates em `AGENTS.md` (PR próprio, após o piloto)
  - Done when: revisão concluída com registro dos achados que uma revisão única não traria, do custo em tokens comparado a uma revisão simples, e decisão go/no-go para o primeiro time de implementação (expenses, earnings e dispatcher em paralelo, um teammate por módulo)
  - Why: Agent Teams custa linearmente por teammate e não herda contexto; compensa só com specs aprovadas em módulos disjuntos e agenda para revisar PRs em paralelo. O piloto em revisão tem custo único e nenhuma coordenação de código ([roadmap, Fase 2](roadmap.md#fase-2--domínio-por-fatias-verticais))

## Fase 3 — Frontend

- [ ] **FC-006 — Identidade visual da plataforma**
  - What: definir marca (logo e nome de exibição), paleta com contraste AA, tipografia, escala de espaçamento, iconografia e os breakpoints de referência (celular, tablet, desktop); exportar tudo como design tokens consumíveis pelo tema do frontend (Tailwind + shadcn/ui, ADR-0001); validar numa tela de referência (dashboard de saldo) desenhada nos três tamanhos
  - Where: `docs/design/visual-identity.md` e `docs/design/assets/` neste repo; tokens replicados no tema do `finances-control-frontend` quando o repo existir
  - Done when: documento aprovado, tokens versionados e a tela de referência prototipada nos três breakpoints com experiência agradável em cada um ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais))
  - Why: o frontend nasce mobile-first e o tema do shadcn/ui é alimentado por tokens — sem identidade definida, as primeiras telas nascem com valores padrão e viram retrabalho. Pode correr em paralelo à Fase 2
