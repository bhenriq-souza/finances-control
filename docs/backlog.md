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
- [x] **FCB-006 — Database dedicado + migrations** — feito: spec 0003 e ADR local 0001 no backend; DB `finances_dev` e role `finances_app` dedicados, secrets `homelab-dev-finances-database-*` no GCP Secret Manager entregues por ExternalSecret, migrations num initContainer, `/health/ready` sondando o banco

## Fase 2 — Domínio (specs formais no backend)

Concluída em 2026-10-09: primeira versão do backend no ar em dev ([roadmap, Fase 2](roadmap.md#fase-2--domínio-por-fatias-verticais-concluída)). A FCB-013 ficou fora da versão.

- [x] **FCB-007 — Spec + implementação F001**: usuários e autenticação (Firebase/Google, RBAC Admin/Biller/Viewer)
- [x] **FCB-008 — Spec + implementação F002**: bancos, contas bancárias e cartões de crédito
- [x] **FCB-009 — Spec + implementação F003**: despesas (fixas/variáveis/parceladas, status, reflexo em saldo/limite)
- [x] **FCB-010 — Spec + implementação F004**: faturas de cartão de crédito
- [x] **FCB-011 — Spec + implementação F005**: receitas
- [x] **FCB-012 — Saldo previsto e relatórios**
- [x] **FCB-014 — Dispatcher de eventos de domínio in-process** (interface na camada `platform`, dispatch pós-commit, preparada para outbox — ADR-0005; precede FCB-009)
- [ ] **FCB-013 — Importação CSV** (bancos/contas/cartões, despesas, receitas) — **fora da primeira versão** do backend, por decisão do responsável em 2026-10-09
- [x] **FCB-015 — Jobs assíncronos e agendados com `pg-boss`** (worker de importação, Aberto→Vencido, fechamento de fatura, recorrência mensal — ADR-0005)
- [x] **FC-007 — Piloto de Agent Teams na revisão da spec 0012 (expenses)** — [#13](https://github.com/bhenriq-souza/finances-control/issues/13) — **encerrada sem execução** em 2026-10-10: a spec `0012` foi aprovada e implementada antes do piloto, e o playbook de subagentes em worktrees ([backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/docs/parallel-execution.md)) rodou 14 rodadas com bom resultado. A Fase 3 segue com subagentes, sem condição de go/no-go

## Fase 3 — Frontend

- [ ] **FCB-020 — Plataforma HTTP para o frontend** (backend, spec `0005`): erros de protocolo em JSON, códigos de erro enumerados no contrato, `401`/`403` declarados e a publicação sob `/api` por `stripPrefix` ([ADR-0008](adr/ADR-0008-api-path-prefix.md))
- [ ] **FCB-007, revisão de 2026-10-10** (backend, spec `0010`): email verificado no bootstrap, re-vínculo por email verificado e troca do projeto Firebase para `dev-financial-control` ([ADR-0009](adr/ADR-0009-firebase-project.md))

- [x] **FC-008 — Configurar o projeto Firebase para o login do F001** — [#16](https://github.com/bhenriq-souza/finances-control/issues/16) — **concluída em 2026-10-10**, no projeto próprio `dev-financial-control` ([ADR-0009](adr/ADR-0009-firebase-project.md)).
    - Verificado pela API de administração do Identity Platform:
        - provedores email/senha e Google habilitados;
        - domínios autorizados `localhost`, os dois do projeto e `finances.dev.homelab.local`;
        - app Web `finances-frontend` registrado.
    - A chave da service account do `firebase-admin` virou a versão 2 do secret
      `homelab-dev-finances-firebase-service-account`. O backend passa a usá-la na T-0010-08.

- [ ] **FC-006 — Identidade visual da plataforma** — [#8](https://github.com/bhenriq-souza/finances-control/issues/8)
  - What: definir a identidade com os tipos de Artifact do Claude.
      - Primeiro um **Design System**:
          - marca (logo e nome de exibição) e voz dos textos em pt-BR;
          - paleta clara e escura com contraste AA, incluindo cores de saldo positivo e negativo e uma por status de lançamento;
          - tipografia com algarismos tabulares, escala de espaçamento, radius, iconografia (lucide) e os breakpoints de celular, tablet e desktop;
          - componentes de dinheiro, status, lista que vira cards e app shell.
      - Depois um **Design** da tela de referência, o dashboard de saldo, nos três tamanhos, que valida o Design System.
      - Aprovados, os tokens saem para um arquivo versionado neste repo e dele para o tema Tailwind + shadcn/ui do frontend ([ADR-0001](adr/ADR-0001-frontend.md)).
  - Where:
      - os artifacts Design System e Design no claude.ai;
      - neste repo:
          - `docs/design/visual-identity.md`, com os links e as versões dos artifacts;
          - `docs/design/tokens.json`, em formato DTCG, que é a fonte de verdade dos tokens;
          - `docs/design/assets/`, com o logo;
          - `docs/design/screens/`, com os PNGs aprovados.
      - O tema do `finances-control-frontend` é gerado do `tokens.json`.
  - Done when:
      - Design System aprovado;
      - `tokens.json` versionado, com o contraste AA dos pares texto/fundo verificado por script;
      - dashboard de saldo prototipado nos três breakpoints com experiência agradável em cada um ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais));
      - `visual-identity.md` aprovado.
  - Why: o frontend nasce mobile-first e o tema do shadcn/ui é alimentado por tokens — sem identidade definida, as primeiras telas nascem com valores padrão e viram retrabalho. Os artifacts vivem fora do git; por isso os tokens e as telas aprovadas ficam versionados aqui, e nas specs de tela o comportamento continua mandando sobre o design
