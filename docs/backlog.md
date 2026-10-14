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

- [x] **FCB-020 — Plataforma HTTP para o frontend** (backend, spec `0005`): erros de protocolo em JSON, códigos de erro enumerados no contrato, `401`/`403` declarados e a publicação sob `/api` por `stripPrefix` ([ADR-0008](adr/ADR-0008-api-path-prefix.md))
- [x] **FCB-007, revisão de 2026-10-10** (backend, spec `0010`): email verificado no bootstrap, re-vínculo por email verificado e troca do projeto Firebase para `dev-financial-control` ([ADR-0009](adr/ADR-0009-firebase-project.md), [ADR-0010](adr/ADR-0010-firebase-project-dev.md))

- [x] **FC-008 — Configurar o projeto Firebase para o login do F001** — [#16](https://github.com/bhenriq-souza/finances-control/issues/16)
    - Concluída em 2026-10-10 no projeto **`dev-financial-control`** ([ADR-0010](adr/ADR-0010-firebase-project-dev.md)), e não no `homelab-492918` que o texto abaixo, escrito antes da correção, cita: provedores email/senha e Google, `finances.dev.homelab.local` autorizado, app Web `finances-frontend` e a chave como versão 2 do secret `homelab-dev-finances-firebase-service-account`.
    - What: no projeto `homelab-492918` ([ADR-0009](adr/ADR-0009-firebase-project.md)), onde o Firebase já foi ativado em 2026-10-10:
        1. habilitar os provedores **email/senha** e **Google**;
        2. acrescentar `finances.dev.homelab.local` aos domínios autorizados;
        3. registrar um app **Web**, cuja web config o frontend recebe em runtime;
        4. gerar uma chave da service account do `firebase-admin` e gravá-la como nova versão do secret `homelab-dev-finances-firebase-service-account`.
    - Where: console do Firebase (Authentication → Sign-in method e Settings → Authorized domains; Configurações do projeto → Seus apps e Contas de serviço) e GCP Secret Manager. Não há infraestrutura como código para isto
    - Done when:
        - os provedores aparecem habilitados e o domínio está autorizado, verificáveis pela API de administração do Identity Platform (`/admin/v2/projects/homelab-492918/config` e `.../defaultSupportedIdpConfigs`);
        - a web config está registrada;
        - o secret tem a versão nova, que a T-0010-08 do backend consome.
    - Why: bloqueia o F001 no frontend, o spike de login do [ADR-0006](adr/ADR-0006-auth.md) e a troca de projeto no backend (T-0010-08)

- [x] **FC-006 — Identidade visual da plataforma** — [#8](https://github.com/bhenriq-souza/finances-control/issues/8)
  - Concluída em 2026-10-11: o produto se chama **FTech Finance** e usa a identidade da **FarmTech**, dona dele. Design System, Design do dashboard nos três tamanhos e nos dois temas, `tokens.json`, marca e verificação de contraste em [`docs/design/`](design/visual-identity.md). Duas mudanças no previsto: o `tokens.json` fica no formato do Design System do Claude, não em DTCG, porque o Design System não lê DTCG e dois formatos divergiriam; e as telas aprovadas são os artboards do canvas, linkados em `visual-identity.md`, com `screens/` reservado para PNGs exportados.
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
          - `docs/design/tokens.json`, no formato do Design System do Claude, que é a fonte de verdade dos tokens;
          - `docs/design/assets/`, com o logo;
          - `docs/design/screens/`, com os PNGs exportados, quando houver; os artboards aprovados ficam linkados em `visual-identity.md`.
      - O tema do `finances-control-frontend` é gerado do `tokens.json`.
  - Done when:
      - Design System aprovado;
      - `tokens.json` versionado, com o contraste AA dos pares texto/fundo verificado por script;
      - dashboard de saldo prototipado nos três breakpoints com experiência agradável em cada um ([requisitos §4](business-requirements.md#4-requisitos-não-funcionais));
      - `visual-identity.md` aprovado.
  - Why: o frontend nasce mobile-first e o tema do shadcn/ui é alimentado por tokens — sem identidade definida, as primeiras telas nascem com valores padrão e viram retrabalho. Os artifacts vivem fora do git; por isso os tokens e as telas aprovadas ficam versionados aqui, e nas specs de tela o comportamento continua mandando sobre o design

### Repositório do frontend

Issues de entrega `FCF-*` no [`finances-control-frontend`](https://github.com/bhenriq-souza/finances-control-frontend), uma por spec (de fundação e de tela). As tarefas `T-xxxx-yy` vivem no `docs/backlog.md` daquele repositório, como sub-issues destas.

- [x] **FCF-001 — Seed do kit agentic-driven no frontend** — [#1](https://github.com/bhenriq-souza/finances-control-frontend/issues/1): `AGENTS.md`, specs `0000`–`0002` com onze gates (os oito do backend mais `contract`, `build` e `e2e`), orquestrador, skills, hook, CI e CodeQL
- [x] **FCF-002 — Scaffold e estrutura** — [#2](https://github.com/bhenriq-souza/finances-control-frontend/issues/2): spec `0003`; inclui a página mínima do spike de login
- [x] **FCF-003 — Tema gerado do `tokens.json`** — [#3](https://github.com/bhenriq-souza/finances-control-frontend/issues/3): spec `0004`
- [x] **FCF-004 — Cliente da API e erros por `code`** — [#4](https://github.com/bhenriq-souza/finances-control-frontend/issues/4): spec `0005`, contrato fixado na tag `v1.1.0` do backend
- [x] **FCF-005 — Autenticação, app shell e spike do login Google** — [#5](https://github.com/bhenriq-souza/finances-control-frontend/issues/5): spec `0006`; o spike é a primeira tarefa depois das specs de fundação
- [x] **FCF-006 — Publicação do frontend em `dev`** — [#6](https://github.com/bhenriq-souza/finances-control-frontend/issues/6): spec `0007`; imagem nginx, `config.js` por ConfigMap, WIF, manifests e a troca do ingress `/`
- [x] **FCF-007 — Dinheiro no cliente (BRL)** — [#7](https://github.com/bhenriq-souza/finances-control-frontend/issues/7): spec `0008`

Telas (Fase 3, _Done when_ das telas de F001–F005 e relatórios). Specs de tela com o número da spec de domínio do backend; só o dashboard tem design aprovado, as demais telas seguem um canvas de padrões no Design do Claude.

- [x] **FCF-008 — Componentes de lista e dados de referência** — [#49](https://github.com/bhenriq-souza/finances-control-frontend/issues/49): spec `0009`: `StatusBadge`, `EntryList`, página **Mais**, primitivas de formulário e consultas de referência compartilhadas
- [x] **FCF-009 — Administração de usuários e perfis** — [#50](https://github.com/bhenriq-souza/finances-control-frontend/issues/50): spec `0010` (F001): concessão, troca e revogação de perfil, só ADMIN
- [x] **FCF-010 — Bancos, contas e cartões** — [#51](https://github.com/bhenriq-souza/finances-control-frontend/issues/51): spec `0011` (F002)
- [x] **FCF-011 — Despesas** — [#52](https://github.com/bhenriq-souza/finances-control-frontend/issues/52): spec `0012` (F003): lista, lançamento variável, parcelado e fixo, status e tipos
- [x] **FCF-012 — Faturas de cartão e estornos** — [#53](https://github.com/bhenriq-souza/finances-control-frontend/issues/53): spec `0013` (F004)
- [x] **FCF-013 — Receitas** — [#54](https://github.com/bhenriq-souza/finances-control-frontend/issues/54): spec `0014` (F005)
- [x] **FCF-014 — Dashboard de saldo e relatórios** — [#55](https://github.com/bhenriq-souza/finances-control-frontend/issues/55): spec `0015`: o dashboard aprovado no lugar da tela inicial provisória, e os relatórios
- [x] **FCF-015 — Séries fixas** — [#56](https://github.com/bhenriq-souza/finances-control-frontend/issues/56): spec `0017`: listagem e encerramento das séries de despesas e de receitas
- [x] **FCF-016 — Transferências entre contas** — [#57](https://github.com/bhenriq-souza/finances-control-frontend/issues/57): spec `0018`

#### Pendências registradas (sem execução agendada)

- [ ] **DNS de `homelab.local` para os aparelhos da rede** — adiado por decisão do responsável; até lá, celular e tablet entram por `finances.192.168.15.97.nip.io`. Proposta para quando voltar: fixar o DNS do nó, tornar o CoreDNS do cluster recursivo e apontar o DNS do DHCP do roteador para ele
- [ ] **Content-Security-Policy no nginx do frontend** — a spec `0007` adiou para depois do spike; o script inline de tema (spec `0004`) precisará de hash
- [ ] **Unificar as regras de lint de cor e de dinheiro** — hoje a de cor reexpõe `no-restricted-syntax` como `ftech/no-restricted-syntax`; opcional, num bloco só

## Fase 3.1 — Ajustes dos testes em dev

Pontos levantados pelo responsável ao testar `dev` com o roteiro de testes, em 2026-10-13. Cada item segue o fluxo spec-driven do seu repositório: PR de spec primeiro, depois a implementação.

- [x] **FCF-017 — Ajustes dos testes em dev** — [#119](https://github.com/bhenriq-souza/finances-control-frontend/issues/119): specs `0009`, `0012`, `0013`, `0014`: botões e **Mostrar arquivados** padronizados nas telas de tipos, lista depois de criar, menu do usuário acima do botão flutuante, **Fatura de** opcional e escondido com a fatura inferida, caminho para a fatura atual, favicon
- [x] **FCF-018 — Seletor de data próprio** — [#120](https://github.com/bhenriq-souza/finances-control-frontend/issues/120): ADR local e spec `0009`: digitação dd/mm/aaaa e calendário em pt-BR do shadcn/ui, no lugar do `<input type="date">` nativo
- [x] **FCF-019 — Ações rápidas nas listas** — [#121](https://github.com/bhenriq-souza/finances-control-frontend/issues/121): specs `0009`, `0012`, `0014`: pagar, receber, confirmar, editar e excluir pela lista; **Mais ações** no detalhe pelo celular
- [x] **FCF-020 — Fluxo de caixa** — [#122](https://github.com/bhenriq-souza/finances-control-frontend/issues/122): revisão da spec `0015` (as telas usam o número da spec do backend que consomem): `/fluxo-de-caixa`, tela por mês com saldos, entradas e saídas, a lista do mês com uma linha por fatura de cartão, filtro de situação e, desde 2026-10-14, filtro por conta, com as transferências da conta
- [x] **FCB-021 — Extrato de conta** (backend) — [#178](https://github.com/bhenriq-souza/finances-control-backend/issues/178): movimentos de uma conta num período, com saldo inicial e saldo após cada movimento
- [x] **FCF-021 — Extrato de conta** — [#123](https://github.com/bhenriq-souza/finances-control-frontend/issues/123): revisão da spec `0015`: extrato em `/contas/$contaId`, com o link **Extrato** na lista de contas; depende da FCB-021
- [x] **FCB-022 — Foto do usuário** (backend) — [#179](https://github.com/bhenriq-souza/finances-control-backend/issues/179): spec `0010` revisada; foto guardada no backend, sem Firebase Storage (que exigiria faturamento no projeto)
- [x] **FCF-022 — Foto do usuário** — [#124](https://github.com/bhenriq-souza/finances-control-frontend/issues/124): enviar, trocar e remover a foto pelo menu do usuário; depende da FCB-022

## Fase 4 — Promoção a prd

Publicação em `prd`, só na rede de casa ([ADR-0011](adr/ADR-0011-prd-environment.md)). Recursos fora dos repositórios (projeto Firebase, secrets, manifests no cluster, pasta no Drive) só são criados com o ok do responsável em cada item.

- [ ] **FC-009 — Projeto Firebase de `prd`** — o responsável cria o projeto na conta pessoal, com email/senha e Google, os dois endereços de `prd` nos domínios autorizados e o app Web; a chave da service account vai para o Secret Manager do `homelab-492918`
- [ ] **FC-010 — Manifests de `prd` no `homelab-gitops`** — em `clusters/homelab/workloads/prd`: PostgreSQL próprio, backend, frontend, ingress nos dois endereços e ExternalSecrets do `gcp-prd` (banco, Firebase, email do admin de bootstrap); deploy de `main` para `prd` nos dois repositórios
- [ ] **FC-011 — Backup do PostgreSQL de `prd`** — CronJob diário com `pg_dump`, cópia em `/data/backups` no mini PC e na pasta `backups` do Drive (rclone com token OAuth do responsável no Secret Manager), retenção definida, e uma restauração testada num banco descartável
- [ ] **FCB-023 — Carga inicial de `prd`** (backend) — script que lê os CSVs da planilha `finances-control - carga inicial prd` e grava pelos serviços do domínio, para que saldos, faturas e parcelas sigam as invariantes; roda da máquina do responsável, sem os dados entrarem no Git; as faturas já fechadas e não pagas entram como despesa da conta pagadora no vencimento
- [ ] **FC-012 — Primeira promoção a `prd`** — criar `main` no backend, merge de `develop` em `main` nos dois repositórios, sync do Argo CD e checagem de fumaça (`/health` e página inicial)

