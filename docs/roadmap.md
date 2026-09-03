# Roadmap

Fases com Definition of Done. O trabalho detalhado vive no [backlog](backlog.md) e é espelhado no board do GitHub.

## Fase 0 — Fundações (em andamento)

Repos, método e decisões de base.

**Done when:**
- [x] Repo hub `finances-control` criado com docs organizados (requisitos, ADRs, roadmap, backlog)
- [x] Repo `finances-control-backend` criado
- [x] Board (GitHub Projects v2) criado, agregando issues dos repos — [Finances Control](https://github.com/users/bhenriq-souza/projects/2)
- [x] Wiki do hub publicada — [wiki](https://github.com/bhenriq-souza/finances-control/wiki)
- [x] Kit agentic-driven instalado no backend (`AGENTS.md`, spec-process, workflow git, skills, PR template) — FCB-001
- [x] ADR-0001 (frontend) decidido — FC-001
- [x] ADR-0003 (estilo arquitetural) e ADR-0005 (queue) decididos — FC-002
- [ ] ADR-0006 (auth) aprovado — FC-003
- [ ] ADR-0007 (representação monetária) decidido — FC-005

## Fase 1 — Walking skeleton

Provar o caminho código → imagem → cluster antes de qualquer feature. Será a **primeira validação ponta a ponta do CI/CD do homelab**.

**Done when:**
- [x] Backend scaffolded no padrão `ts-express-app` + `@bhs-dev`, com endpoint de health — FCB-002
- [x] Repo registrado no WIF do GCP e secrets configurados — FCB-003
- [x] Push em `develop` builda e publica imagem no Artifact Registry via GitHub Actions — FCB-004
- [x] Manifests no `homelab-gitops` e app rodando em `dev-apps` via Argo CD, acessível em `finances.dev.homelab.local` — FCB-005
- [ ] Database dedicado no PostgreSQL com migration inicial aplicada — FCB-006

**Marco alcançado em 2026-08-28:** o pipeline do homelab rodou de ponta a ponta pela primeira vez. Push em `develop` → imagem `sha-9bd9e07` no Artifact Registry → commit automático no GitOps → Argo CD `Synced/Healthy` → pod `Running` → `GET finances.dev.homelab.local/health` respondendo 200. Antes disso o fluxo nunca havia sido exercitado: a imagem do `myapp` fora publicada manualmente.

Diferenças em relação ao previsto: a credencial de escrita no GitOps virou uma **deploy key SSH por aplicação** em vez de PAT (o GitHub não tem API para criar PAT, e a deploy key tem escopo menor e não expira); e a autorização no WIF exigiu `terraform apply` com `-target`, por causa de um drift preexistente naquele root que planeja destruições em recursos de CI de outro projeto.

## Fase 2 — Domínio por fatias verticais

Cada fatia nasce como spec formal (AC/INV/ERR) e vira tarefas no backlog. A [análise da planilha legada](legacy-spreadsheet-analysis.md) é insumo desta fase: fornece dinâmicas já validadas em uso, critérios de aceite derivados de falhas reais e dados de seed. Ordem por dependência:

1. F001 — Usuários e autenticação (FCB-007)
2. F002 — Bancos, contas e cartões (FCB-008)
3. F003 — Despesas, incluindo parcelamento (FCB-009)
4. F004 — Faturas de cartão (FCB-010)
5. F005 — Receitas (FCB-011)
6. Saldo previsto e relatórios (FCB-012)
7. Importação CSV (FCB-013)

**Done when:** todas as specs `implemented`, endpoints cobertos por testes, API documentada via OpenAPI.

## Fase 3 — Frontend

Stack decidida no [ADR-0001](adr/ADR-0001-frontend.md): React 19 + Vite, SPA pura servida como imagem estática, mesma origem do backend via `/api`. Repo próprio `finances-control-frontend`, mesmo pipeline (app-name `finances-frontend` no GitOps). Requisito transversal: experiência agradável em desktop, celular e tablet ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais)).

**Done when:**
- [ ] Identidade visual e design tokens definidos — FC-006 (pode correr em paralelo à Fase 2)
- [ ] Repo `finances-control-frontend` criado com o kit agentic-driven, scaffold do ADR-0001 e pipeline validado (tarefas `FCF-*`, a abrir quando o repo existir)
- [ ] Backend publicado sob `/api` e frontend em `/`, no mesmo host
- [ ] Telas de F001–F005 e relatórios consumindo a API pelo cliente gerado do OpenAPI, responsivas nos três breakpoints

## Fase 4 — Promoção a prd

Definir gates de promoção dev→prd (hoje `prd-apps` está vazio no cluster), backup do PostgreSQL implementado antes de dados reais.

## Contínuo

- Implementar pacotes `@bhs-dev` faltantes conforme a dor aparecer (`logger` e `middlewares` primeiro).
- Alimentar ADRs a cada decisão relevante.
