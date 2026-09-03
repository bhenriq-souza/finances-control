# ADR-0001 — Stack do front-end

- Status: **accepted**
- Data: 2026-09-03

## Context

A plataforma é acessível via web e precisa oferecer experiência agradável no browser do computador, do celular e do tablet ([requisitos de negócio, §4](../business-requirements.md#4-requisitos-não-funcionais)). Não há público externo nem SEO: o acesso é restrito à rede local, sem TLS, e toda a aplicação é autenticada.

Decisões já aceitas restringem a escolha:

- **[ADR-0000](ADR-0000-hosting.md)**: toda app é uma imagem OCI com app-name e manifests próprios no `homelab-gitops`, num cluster single-node com orçamento conservador (~50m CPU / 96–128Mi por pod).
- **[ADR-0002](ADR-0002-backend.md)**: o backend expõe contrato **OpenAPI** (`docs/openapi.yaml`) e valida entradas com **zod**.
- **[ADR-0006](ADR-0006-auth.md)** (proposta): identidade delegada ao **Firebase Auth** — o cliente obtém o ID token e o backend o valida a cada requisição.
- Método **agentic-driven**: o repositório do frontend carrega o mesmo kit do backend (`AGENTS.md`, specs, gates) e a implementação é feita por agentes. Isso favorece stacks mainstream, com tooling maduro de typecheck/lint/test e grande corpus de referência.

O histórico do usuário com React (2016–2020) e Angular (2017–2018) é anterior às versões atuais de ambos; qualquer escolha implica reaprendizado, e esse critério pesou pouco.

## Decision

- **React 19 + Vite, SPA pura** (renderização no cliente, sem SSR), TypeScript strict, em repositório novo: **`finances-control-frontend`**.
- Kit fixado, para que o `AGENTS.md` do repositório seja previsível:
  - **Roteamento e dados**: TanStack Router (rotas tipadas) e TanStack Query (cache e estado de servidor).
  - **Formulários**: react-hook-form + zod, reaproveitando os schemas do backend onde fizer sentido.
  - **Cliente de API gerado do `openapi.yaml` do backend** (`openapi-typescript` + `openapi-fetch`). O contrato OpenAPI é a única fonte de verdade: o frontend não define tipos de API à mão.
  - **UI**: Tailwind CSS + shadcn/ui — componentes acessíveis copiados para o repositório e temáveis por design tokens. O tema (cores, tipografia, espaçamento, breakpoints) é entregue pela identidade visual (FC-006).
  - **Auth**: Firebase JS SDK no cliente; o ID token segue no header `Authorization` de toda chamada.
  - **Testes**: Vitest + Testing Library para unidade e componente. E2E (Playwright) é decisão local do repositório, na sua spec de quality gates.
- **Mobile-first**: os layouts nascem para a menor tela e expandem por breakpoints; tabelas densas de lançamentos ganham apresentação alternativa (lista/cards) em telas estreitas.
- **Dinheiro nunca é ponto flutuante, também no cliente**: valores monetários trafegam e são manipulados como inteiro de centavos (ou string decimal) e só viram texto na apresentação, via `Intl.NumberFormat`. A representação definitiva é assunto do ADR-0007 (FC-005).
- **Empacotamento**: build estático servido por **nginx** (imagem unprivileged), em Dockerfile multi-stage a partir de `node:22`. A configuração de ambiente (Firebase web config) é injetada em **runtime**, no start do container, para que a mesma imagem promova de dev para prd (Fase 4).
- **Mesma origem**: roteamento por path no Traefik — `/` → frontend, `/api` → backend — num único host `finances.<env>.homelab.local`. Sem CORS e com URL de API relativa.

## Consequences

- Imagem do frontend leve (10–20Mi de memória) e sem processo Node em runtime — cabe folgada no orçamento do cluster.
- A autenticação mantém uma única camada de validação, no backend; o frontend não guarda sessão própria.
- O backend passa a responder sob o prefixo `/api` (e `/api/docs`): ajuste no ingress do `homelab-gitops` (criado em FCB-005) e nas rotas do backend quando o frontend for publicado.
- A SPA exige fallback de rotas no nginx (`try_files … /index.html`) e política de cache distinta para `index.html` (sem cache) e assets com hash (cache longo).
- Sem SSR, o primeiro carregamento depende do bundle. Irrelevante em rede local, mas o repositório mantém code-splitting por rota e um gate de tamanho de bundle.
- O kit é uma composição de bibliotecas: trocar uma peça exige ADR local no `finances-control-frontend` (`specs/adr/`), não um novo ADR neste hub.
- Frontend e backend têm ciclos de deploy independentes (app-names `finances-frontend` e `finances-backend`).

## Alternatives considered

- **Next.js (App Router / RSC)**: exigiria servidor Node na imagem (disputando o mesmo orçamento do backend), uma segunda camada de auth (cookie de sessão + verificação server-side) e criaria a tentação de Server Actions acessarem dados por fora do contrato OpenAPI. SEO, streaming e edge não têm uso num app interno autenticado.
- **Angular 21+ (standalone, signals)**: opinionado, TypeScript-first, DI análoga ao tsyringe do backend e CLI com gates prontos. Preterido pelo corpus menor para agentes e pelo bundle maior; o reaprendizado seria equivalente ao de React, sem a vantagem de ecossistema.
- **Vue 3 + Vite**: viável e leve, mas sem ancoragem no histórico do usuário e com corpus menor que React. Nenhuma vantagem que compense.
- **Servir o frontend pelo próprio Express do backend**: um deploy só e sem CORS, mas acopla os ciclos de release e contraria o ADR-0000 (um app-name por deployment) e a promoção independente dev→prd.
- **Biblioteca de componentes fechada (MUI, Mantine, Ant Design)**: menos decisões iniciais, porém o tema fica preso à biblioteca e a identidade visual (FC-006) perde liberdade. shadcn/ui dá o mesmo ponto de partida com o código sob controle do repositório.
- **React Router v7**: alternativa madura ao TanStack Router; preterido pela tipagem de rotas e pela integração nativa com TanStack Query.
