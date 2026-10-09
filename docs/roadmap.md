# Roadmap

Fases com Definition of Done. O trabalho detalhado vive no [backlog](backlog.md) e é espelhado no board do GitHub.

## Fase 0 — Fundações (concluída)

Repos, método e decisões de base.

**Done when:**
- [x] Repo hub `finances-control` criado com docs organizados (requisitos, ADRs, roadmap, backlog)
- [x] Repo `finances-control-backend` criado
- [x] Board (GitHub Projects v2) criado, agregando issues dos repos — [Finances Control](https://github.com/users/bhenriq-souza/projects/2)
- [x] Wiki do hub publicada — [wiki](https://github.com/bhenriq-souza/finances-control/wiki)
- [x] Kit agentic-driven instalado no backend (`AGENTS.md`, spec-process, workflow git, skills, PR template) — FCB-001
- [x] ADR-0001 (frontend) decidido — FC-001
- [x] ADR-0003 (estilo arquitetural) e ADR-0005 (queue) decididos — FC-002
- [x] ADR-0006 (auth) aprovado — FC-003
- [x] ADR-0007 (representação monetária) decidido — FC-005

## Fase 1 — Walking skeleton (concluída)

Provar o caminho código → imagem → cluster antes de qualquer feature. Foi a **primeira validação ponta a ponta do CI/CD do homelab**.

**Done when:**
- [x] Backend scaffolded no padrão `ts-express-app` + `@bhs-dev`, com endpoint de health — FCB-002
- [x] Repo registrado no WIF do GCP e secrets configurados — FCB-003
- [x] Push em `develop` builda e publica imagem no Artifact Registry via GitHub Actions — FCB-004
- [x] Manifests no `homelab-gitops` e app rodando em `dev-apps` via Argo CD, acessível em `finances.dev.homelab.local` — FCB-005
- [x] Database dedicado no PostgreSQL com migration inicial aplicada — FCB-006

**Marco alcançado em 2026-08-28:** o pipeline do homelab rodou de ponta a ponta pela primeira vez. Push em `develop` → imagem `sha-9bd9e07` no Artifact Registry → commit automático no GitOps → Argo CD `Synced/Healthy` → pod `Running` → `GET finances.dev.homelab.local/health` respondendo 200. Antes disso o fluxo nunca havia sido exercitado: a imagem do `myapp` fora publicada manualmente.

Diferenças em relação ao previsto: a credencial de escrita no GitOps virou uma **deploy key SSH por aplicação** em vez de PAT (o GitHub não tem API para criar PAT, e a deploy key tem escopo menor e não expira); e a autorização no WIF exigiu `terraform apply` com `-target`, por causa de um drift preexistente naquele root que planeja destruições em recursos de CI de outro projeto.

**Fase encerrada em 2026-09-17.** O banco dedicado `finances_dev` e o role `finances_app` existem na
instância do cluster, a credencial chega ao pod pelo External Secrets Operator, e as migrations rodam
num initContainer antes de a aplicação subir — decisão registrada no
[ADR local 0001](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/adr/0001-migration-execution.md)
do backend. `GET finances.dev.homelab.local/health/ready` responde 200 com `database: up`.

A migration inicial é deliberadamente mínima: cria só a função `set_updated_at()`, compartilhada
pelas tabelas futuras. O schema de negócio nasce fatia a fatia na Fase 2, com a spec que o justifica
— uma baseline completa do diagrama seria schema sem spec que o sustente.

Tudo isso está formalizado na
[spec 0003](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0003-persistence.md)
do backend, que fixa também as convenções de schema que valem para todas as specs de domínio: nomes
em `snake_case`, chave primária `uuid`, `timestamptz` em UTC e dinheiro em `numeric(14,2)`
convertido para inteiro de centavos na fronteira do ORM.

## Fase 2 — Domínio por fatias verticais

Cada fatia nasce como spec formal (AC/INV/ERR) e vira tarefas no backlog. A [análise da planilha legada](legacy-spreadsheet-analysis.md) é insumo desta fase: fornece dinâmicas já validadas em uso, critérios de aceite derivados de falhas reais e dados de seed. Ordem por dependência:

1. F001 — Usuários e autenticação (FCB-007)
2. F002 — Bancos, contas e cartões (FCB-008)
3. F003 — Despesas, incluindo parcelamento (FCB-009)
4. F004 — Faturas de cartão (FCB-010)
5. F005 — Receitas (FCB-011)
6. Saldo previsto e relatórios (FCB-012)
7. ~~Importação CSV (FCB-013)~~ — **fora da primeira versão**, por decisão do responsável em 2026-10-09

**Modo de trabalho (decidido em 2026-09-03):** desenvolvimento em sessão única com subagentes até a spec `0012` (expenses). A revisão dessa spec é o **piloto de Agent Teams** (FC-007): três revisores que debatem entre si, custo único, sem coordenação de código. O primeiro time de implementação só nasce quando duas ou mais specs estiverem aprovadas ao mesmo tempo em módulos disjuntos — candidatos: expenses (FCB-009), earnings (FCB-011) e dispatcher (FCB-014) — e houver agenda para revisar PRs em paralelo. Um teammate por módulo, em worktree e branch próprios; `backlog.md`, `openapi.yaml`, migrations e `platform` ficam com o lead. Times não economizam tokens (custo linear por teammate): compram tempo de calendário e verificação cruzada.

**Execução paralela com subagentes (experimento de 2026-10-06):** com as specs `0004` e `0012`–`0018` aprovadas, o backend rodou duas rodadas de subagentes em worktrees próprios: 2 tarefas (T-0004-01, T-0012-03) e depois 3 (T-0004-02, T-0012-01, T-0014-01). Todas saíram com `npm run check` verde na primeira tentativa, nenhuma parou com dúvida de spec, e cada subagente gastou entre ~50 mil e ~75 mil tokens. A regra acima de deixar migrations e `platform` com o lead foi relaxada: cada tarefa cria a sua própria migration, e arquivos compartilhados são aceitos quando a mudança é só acréscimo, com o lead resolvendo os conflitos no rebase. O limite real não foi custo, e sim o grafo de dependências do backlog, o `npm run check` serial num banco de teste único e a revisão humana. Regras, briefing e medições no [playbook do backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/docs/parallel-execution.md).

**Done when:** todas as specs `implemented`, endpoints cobertos por testes, API documentada via OpenAPI.

## Fase 3 — Frontend

Stack decidida no [ADR-0001](adr/ADR-0001-frontend.md): React 19 + Vite, SPA pura servida como imagem estática, mesma origem do backend via `/api`. Repo próprio `finances-control-frontend`, mesmo pipeline (app-name `finances-frontend` no GitOps). Requisito transversal: experiência agradável em desktop, celular e tablet ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais)). Fase de maior retorno esperado para Agent Teams — as telas de F001–F005 são rotas e arquivos disjuntos, e o contrato OpenAPI permite frontend e backend em paralelo — condicionada ao go do piloto FC-007.

**Done when:**
- [ ] Identidade visual e design tokens definidos — FC-006 (pode correr em paralelo à Fase 2)
- [ ] Repo `finances-control-frontend` criado com o kit agentic-driven, scaffold do ADR-0001 e pipeline validado (tarefas `FCF-*`, a abrir quando o repo existir)
- [ ] Spike: login Google (Firebase) validado numa origem HTTP fora de `localhost`, antes da spec de login — risco registrado no [ADR-0006](adr/ADR-0006-auth.md)
- [ ] Backend publicado sob `/api` e frontend em `/`, no mesmo host
- [ ] Telas de F001–F005 e relatórios consumindo a API pelo cliente gerado do OpenAPI, responsivas nos três breakpoints

## Fase 4 — Promoção a prd

Definir gates de promoção dev→prd (hoje `prd-apps` está vazio no cluster), backup do PostgreSQL implementado antes de dados reais.

## Contínuo

- Implementar pacotes `@bhs-dev` faltantes conforme a dor aparecer (`logger` e `middlewares` primeiro).
- Alimentar ADRs a cada decisão relevante.
