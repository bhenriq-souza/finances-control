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

## Fase 2 — Domínio por fatias verticais (concluída)

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

**Done when:**
- [x] Todas as specs `implemented` — `0010` a `0015`, `0017` e `0018`
- [x] Endpoints cobertos por testes — `npm run check` verde nos 7 gates, 107 suítes e 1214 testes
- [x] API documentada via OpenAPI — 75 operações, conferidas contra as rotas do código por teste

**Fase encerrada em 2026-10-09: a primeira versão do backend está pronta e no ar em dev.** O
`develop` em `841ce1e` roda no `dev-apps` como `sha-841ce1e`, com `GET /health/ready` respondendo 200
com `database: up` e `jobs: up`. O responsável validou o acesso pelo Postman em
`finances.dev.homelab.local`.

O que a versão entrega, por spec do backend:

| Spec   | Entrega                                                                                       | Issue             |
| ------ | --------------------------------------------------------------------------------------------- | ----------------- |
| `0010` | Usuários, autenticação pelo ID token do Firebase e perfis `ADMIN`/`BILLER`/`VIEWER`           | FCB-007           |
| `0011` | Bancos, contas bancárias e cartões de crédito, com conta pagadora do cartão                   | FCB-008           |
| `0012` | Despesas fixas, variáveis e parceladas, tipos de despesa e status, com reflexo em saldo/limite | FCB-009           |
| `0013` | Faturas de cartão: fechamento, estornos e pagamento, inclusive antecipado                     | FCB-010           |
| `0014` | Receitas, tipos de receita e status                                                           | FCB-011           |
| `0015` | Saldo realizado, saldo previsto com dívida dos cartões, relatórios por tipo e fluxo de caixa  | FCB-012           |
| `0017` | `pg-boss`, rotinas diárias e séries de lançamentos fixos (despesas e receitas)                | FCB-014, FCB-015  |
| `0018` | Transferências entre contas próprias, concluídas e agendadas, refletidas nos relatórios       | FCB-018           |

Para testar à mão, o backend versiona uma collection do Postman gerada do contrato, com ambientes
local e dev e obtenção automática do ID token
([`docs/postman/`](https://github.com/bhenriq-souza/finances-control-backend/tree/develop/docs/postman)).
Desde 2026-10-09, um CoreDNS do cluster (`homelab-gitops`, PRs #8 e #9) responde
`*.homelab.local → 192.168.15.97` em `192.168.15.97:53`. Ele é autoritativo só para essa zona e não é
recursivo, então cada cliente encaminha `homelab.local` para ele. Isso funciona em computador, mas
celular e tablet precisam do encaminhamento no roteador (Fase 3).

Ficaram fora da versão: a importação CSV (FCB-013), por decisão do responsável, e qualquer ambiente
de produção, que é a [Fase 4](#fase-4--promoção-a-prd).

Diferenças em relação ao previsto: as transferências entre contas (spec `0018`) e os jobs com
`pg-boss` (spec `0017`) não estavam na lista inicial e entraram por necessidade do domínio — sem
transferência, o saldo realizado não fecha com o saldo corrente das contas; sem jobs, não há
fechamento de fatura nem série de lançamentos fixos. O schema `pgboss` é migrado num initContainer,
como as migrations TypeORM, e a aplicação nunca o migra no boot.

## Fase 3 — Frontend (concluída)

Stack decidida no [ADR-0001](adr/ADR-0001-frontend.md): React 19 + Vite, SPA pura servida como imagem estática, mesma origem do backend via `/api`. Repo próprio `finances-control-frontend`, mesmo pipeline (app-name `finances-frontend` no GitOps). Requisito transversal: experiência agradável em desktop, celular e tablet ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais)), no navegador, sem PWA na primeira versão.

**Decisões do levantamento de 2026-10-10:**
- `/api` por `stripPrefix` no ingress, com as rotas do backend na raiz ([ADR-0008](adr/ADR-0008-api-path-prefix.md)).
- Firebase no projeto `dev-financial-control` ([ADR-0010](adr/ADR-0010-firebase-project-dev.md)), com email verificado no bootstrap ([ADR-0009](adr/ADR-0009-firebase-project.md)).
- Contrato OpenAPI baixado do backend no build do frontend, fixado numa tag ou num commit.
- UI só em pt-BR, com as mensagens de erro traduzidas pelo `code` da API.
- Login por email/senha e Google; `PROFILE_PENDING` leva a uma tela de aguardando aprovação.
- **Gates:** os sete do backend, mais `contract`, `build`, `e2e` (Playwright nos três viewports) e um gate de análise de vulnerabilidade de código.
- **Tema escuro:** decidido antes do Design System.
- **Execução:** subagentes em worktrees, como na Fase 2. O piloto de Agent Teams (FC-007) foi encerrado sem execução.

**Done when:**
- [x] Backend pronto para o frontend: erros em JSON, contrato de erros, publicação sob `/api` (FCB-020) e email verificado com a troca de projeto do Firebase (revisão da FCB-007) — concluído em 2026-10-11; contrato marcado na tag `v1.1.0` do backend, que o frontend fixa
- [x] Projeto Firebase configurado para o login (FC-008) — `dev-financial-control`, 2026-10-10
- [x] Identidade visual e design tokens definidos — FC-006, pelo Design System e pelo Design do Claude: [identidade visual](design/visual-identity.md), produto FTech Finance com a marca da FarmTech
- [x] Repo [`finances-control-frontend`](https://github.com/bhenriq-souza/finances-control-frontend) criado com o kit agentic-driven, scaffold do ADR-0001 e pipeline validado — concluído em 2026-10-12: kit (FCF-001), scaffold com os onze gates (FCF-002) e publicação em `dev` pelo workflow reutilizável (FCF-006); tema, cliente da API, autenticação e dinheiro (FCF-003, 004, 005 e 007) seguem em andamento
- [x] Spike: login Google (Firebase) validado numa origem HTTP fora de `localhost`, antes da spec de login — risco registrado no [ADR-0006](adr/ADR-0006-auth.md); passou em 2026-10-12 no desktop e no celular (`signInWithPopup`, `GET /api/users/me` com 200), sem precisar de TLS. O celular entrou por `finances.192.168.15.97.nip.io`, porque o roteador não encaminha o DNS de `homelab.local`
- [x] Backend publicado sob `/api` e frontend em `/`, no mesmo host — `finances.dev.homelab.local`, desde 2026-10-12
- [x] Telas de F001–F005 e relatórios consumindo a API pelo cliente gerado do OpenAPI, responsivas nos três breakpoints — concluído em 2026-10-13: usuários (F001), contas e cartões (F002), despesas (F003), faturas e estornos (F004), receitas (F005), transferências, dashboard de saldo, relatórios e séries fixas (FCF-008 a FCF-016), publicados em `dev`

## Fase 3.1 — Ajustes dos testes em dev

Ajustes e funcionalidades pedidos pelo responsável ao testar `dev` em 2026-10-13, antes da promoção a prd. Itens no [backlog](backlog.md#fase-31--ajustes-dos-testes-em-dev).

**Decisões de 2026-10-13:**
- Seletor de data próprio (shadcn/ui), no lugar do nativo, que é ruim no Firefox para Android.
- Extrato de conta autorizado, com endpoint novo no backend.
- No fluxo de caixa, o gasto de cartão aparece como uma linha por fatura, que é o que sai da conta.
- Foto do usuário guardada no backend: o Firebase Storage exigiria ligar o faturamento no projeto.

**Decisões de 2026-10-14:**
- Filtro por conta no fluxo de caixa; com uma conta escolhida, as transferências dela entram na lista, e o backend devolve as faturas do mês por conta (`cardDueCents`).
- Contrato do backend na tag `v1.3.0` (foto do usuário e faturas do mês por conta), fixada pelo frontend.

**Ordem:** ajustes (FCF-017) junto com o extrato no backend (FCB-021); depois o seletor de data (FCF-018), as ações rápidas (FCF-019), a tela de extrato (FCF-021), o fluxo de caixa (FCF-020) e a foto do usuário (FCB-022 e FCF-022).

**Done when:**
- [x] FCF-017 a FCF-022, FCB-021 e FCB-022 concluídas e publicadas em `dev` — concluído em 2026-10-14: backend `f432b00` (tag `v1.3.0`) e frontend `6016de0` publicados pelo deploy de `develop`
- [ ] Testes do responsável no tablet
- [x] Novo ok do responsável para a Fase 4 — dado em 2026-10-14

## Fase 4 — Promoção a prd

Publicar o sistema em `prd`, só na rede de casa, com backup do PostgreSQL antes dos dados reais e a carga inicial tirada da planilha. Decisões no [ADR-0011](adr/ADR-0011-prd-environment.md); itens no [backlog](backlog.md#fase-4--promoção-a-prd).

**Decisões de 2026-10-14:**
- Sem endereço externo. Dois endereços na rede de casa, como em `dev`: `homelab.local` para o navegador do computador e `nip.io` para o celular.
- Projeto Firebase próprio para `prd`, separado do `dev-financial-control`.
- Backup diário com `pg_dump`, com uma cópia em `/data/backups` no mini PC e outra na pasta `backups` do Google Drive do responsável.
- Carga inicial com os dados reais: bancos, contas com o saldo do dia, cartões, tipos de despesa, despesas fixas e só as parcelas que ainda não saíram. A planilha `finances-control - carga inicial prd`, no Drive do responsável, foi tirada da `cashflow 2025-2026` e é também o modelo da futura importação por CSV.
- O cluster comporta `prd`: em 2026-10-14 o nó usava 7% de CPU e 36% de memória, e o sistema em `dev` ocupa cerca de 370 Mi.

**Ordem:** projeto Firebase (FC-009) e manifests de `prd` (FC-010) em paralelo; depois o backup (FC-011); por último a carga (FCB-023) e a primeira promoção (FC-012).

**Done when:**
- [ ] Projeto Firebase de `prd` configurado (FC-009)
- [ ] Backend, frontend e PostgreSQL de `prd` publicados pelo Argo CD em `prd-apps` (FC-010)
- [ ] Backup diário rodando nas duas cópias e uma restauração testada (FC-011)
- [ ] Planilha da carga revisada pelo responsável, com os campos `PREENCHER` preenchidos
- [ ] Carga inicial feita em `prd` e conferida contra a planilha (FCB-023)
- [ ] Primeira promoção de `develop` para `main` nos dois repositórios, com a checagem de fumaça verde (FC-012)

## Fase 5 — Espaços e isolamento por usuário

Hoje um usuário aprovado enxerga e altera os lançamentos, contas, bancos e cartões de todos: o RBAC do backend é por perfil, não por registro. Esta fase faz de cada usuário aprovado alguém com a sua própria conta no app: todo registro financeiro passa a pertencer a um **espaço**, e o usuário entra num espaço com um perfil. Contrato na spec `0021` do [backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0021-workspaces.md) e do frontend; itens no [backlog](backlog.md#fase-5--espaços-e-isolamento-por-usuário).

**Decisões de 2026-10-15:**
- Espaço com membros (opção B): o perfil (`ADMIN`, `BILLER`, `VIEWER`) vale só dentro do espaço. A alternativa de dado por usuário foi descartada, porque um `VIEWER` não veria nada e ninguém poderia acompanhar as finanças de outra pessoa.
- Dois níveis de permissão: o **admin da plataforma** aprova usuários, cria e renomeia espaços e cuida dos catálogos globais; o **perfil no espaço** segue a matriz atual dentro do espaço. Detalhes em [perfis de usuário](user-profiles.md).
- Bancos continuam um catálogo global.
- Tipos de despesa e de receita também são globais, geridos só pelo admin da plataforma: um tipo criado num espaço apareceria para todos. Tipos próprios de um espaço ficam para depois, sem quebrar nada.
- A aprovação e a atribuição continuam como hoje; a concessão passa a dizer em qual espaço: um espaço novo, do qual o usuário vira `ADMIN`, ou um espaço existente, com um perfil.
- Um espaço por usuário na Fase 5. Vários espaços por pessoa, com troca na tela, ficam para depois.
- Os dados atuais vão para um espaço só, e quem hoje é `ADMIN` vira admin da plataforma.

**Ondas de execução** (subagentes em worktrees, como nas fases anteriores):
1. **Onda 0 — specs em paralelo:** este documento (FC-013), a spec `0021` e o ADR local de escopo no backend (FCB-025) e a spec `0021` do frontend (FCF-025).
2. **Onda 1 — base no backend:** `T-0021-01`, sozinha: esquema, migração dos dados para um espaço, contexto da requisição e guardas. Bloqueia as demais tarefas do backend.
3. **Onda 2 — módulos em paralelo:** `T-0021-02` a `T-0021-07` no backend (identity, contas e cartões, despesas, receitas, faturas e transferências, relatórios e carga) e `T-0021-01` no frontend, contra o contrato da spec.
4. **Onda 3 — fechamento:** `T-0021-08` (suíte de isolamento por rota), tag do contrato do backend, verificação em `dev` com dois usuários reais em espaços diferentes e promoção a `prd` com backup antes da migration.

**Done when:**
- [ ] Specs `0021` do backend e do frontend e ADR local de escopo aprovados (FCB-025, FCF-025)
- [ ] Base dos espaços no backend, com os dados existentes num espaço só (`T-0021-01`)
- [ ] Todos os módulos do backend com escopo por espaço e a suíte de isolamento por rota no CI (`T-0021-02` a `T-0021-08`)
- [ ] Tela de usuários com a aprovação em espaço novo ou existente e o nome do espaço no menu (FCF-025)
- [ ] Tag nova do contrato do backend, fixada pelo frontend
- [ ] Verificação em `dev` com dois usuários em espaços diferentes: nenhum vê nada do outro
- [ ] Promoção a `prd`, com backup antes da migration, e os dados do responsável conferidos no espaço dele

## Contínuo

- Implementar pacotes `@bhs-dev` faltantes conforme a dor aparecer (`logger` e `middlewares` primeiro).
- Alimentar ADRs a cada decisão relevante.
- Importação por CSV no sistema, com a planilha da carga inicial de `prd` como modelo (depois da Fase 4).
