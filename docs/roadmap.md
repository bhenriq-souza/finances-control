# Roadmap

Fases com Definition of Done. O trabalho detalhado vive no [backlog](backlog.md) e é espelhado no board do GitHub.

## Fase 0 — Fundações (em andamento)

Repos, método e decisões de base.

**Done when:**
- [x] Repo hub `finances-control` criado com docs organizados (requisitos, ADRs, roadmap, backlog)
- [x] Repo `finances-control-backend` criado
- [ ] Board (GitHub Projects v2) criado, agregando issues dos repos — FC-004
- [ ] Wiki do hub publicada (conteúdo pronto; aguarda criação da primeira página na UI do GitHub)
- [ ] Kit agentic-driven instalado no backend (`AGENTS.md`, spec-process, workflow git, skills, PR template) — FCB-001
- [ ] ADRs abertos decididos: ADR-0001 (frontend), ADR-0003 (estilo arquitetural), ADR-0005 (queue), ADR-0006 (auth) — FC-001/FC-002/FC-003

## Fase 1 — Walking skeleton

Provar o caminho código → imagem → cluster antes de qualquer feature. Será a **primeira validação ponta a ponta do CI/CD do homelab**.

**Done when:**
- [ ] Backend scaffolded no padrão `ts-express-app` + `@bhs-dev`, com endpoint de health — FCB-002
- [ ] Repo registrado no WIF do GCP e secrets configurados — FCB-003
- [ ] Push em `develop` builda e publica imagem no Artifact Registry via GitHub Actions — FCB-004
- [ ] Manifests no `homelab-gitops` e app rodando em `dev-apps` via Argo CD, acessível em `finances.dev.homelab.local` — FCB-005
- [ ] Database dedicado no PostgreSQL com migration inicial aplicada — FCB-006

## Fase 2 — Domínio por fatias verticais

Cada fatia nasce como spec formal (AC/INV/ERR) e vira tarefas no backlog. Ordem por dependência:

1. F001 — Usuários e autenticação (FCB-007)
2. F002 — Bancos, contas e cartões (FCB-008)
3. F003 — Despesas, incluindo parcelamento (FCB-009)
4. F004 — Faturas de cartão (FCB-010)
5. F005 — Receitas (FCB-011)
6. Saldo previsto e relatórios (FCB-012)
7. Importação CSV (FCB-013)

**Done when:** todas as specs `implemented`, endpoints cobertos por testes, API documentada via OpenAPI.

## Fase 3 — Frontend

Depende do ADR-0001. Repo próprio, mesmo pipeline (app-name separado no GitOps).

## Fase 4 — Promoção a prd

Definir gates de promoção dev→prd (hoje `prd-apps` está vazio no cluster), backup do PostgreSQL implementado antes de dados reais.

## Contínuo

- Implementar pacotes `@bhs-dev` faltantes conforme a dor aparecer (`logger` e `middlewares` primeiro).
- Alimentar ADRs a cada decisão relevante.
