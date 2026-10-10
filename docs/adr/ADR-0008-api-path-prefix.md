# ADR-0008 — Publicação da API sob `/api` por `stripPrefix` no ingress

- Status: **accepted**
- Data: 2026-10-10
- Substitui, no [ADR-0001](ADR-0001-frontend.md), a consequência "o backend passa a responder sob o prefixo `/api` (…) e nas rotas do backend"

## Context

O [ADR-0001](ADR-0001-frontend.md) pôs frontend e backend na mesma origem: `/` para o frontend e
`/api` para o backend, num único host `finances.<env>.homelab.local`, sem CORS. Ele previa que as
rotas do backend passariam a responder sob `/api`.

A primeira versão do backend saiu com 75 operações na raiz (`/users`, `/banks`, …, `/health`,
`/docs`), e os testes HTTP, a collection do Postman e as probes do cluster usam esses caminhos. O
levantamento da Fase 3, de 2026-10-10, comparou duas formas de chegar a `/api`:

- **A:** o prefixo existe só no ingress, que o retira antes de entregar ao backend;
- **B:** o backend monta as rotas sob `/api`.

## Decision

- **Opção A.** O Traefik publica o backend em `/api` com um `Middleware` `stripPrefix` (`traefik.io/v1alpha1`), e as rotas do backend continuam na raiz.
- **O que conhece o prefixo:**
    - o ingress;
    - o `servers` do `openapi.yaml`;
    - o ambiente `dev` do Postman;
    - o redirect do Swagger, que só aceita `X-Forwarded-Prefix` igual a `/api`.
- **Ordem de publicação:** a regra `/api` entra ao lado da regra `/` atual do backend. A regra `/` só passa ao frontend quando ele for publicado.
- **Onde está o detalhe:** na [spec 0005 do backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0005-http-platform.md) (FCB-020).

## Consequences

- Nenhuma rota, teste HTTP ou probe do backend muda; o custo fica no `homelab-gitops` e no contrato.
- O backend não sabe onde está publicado. O contrato precisa dizer, em `servers`, a URL real de cada ambiente.
- **Primeiro `Middleware` do Traefik no cluster.** O padrão vale para os próximos apps que dividirem host.
- Em `dev`, a API fica alcançável pelos dois caminhos até o frontend ocupar `/`.

## Alternatives considered

- **B, prefixo no backend:** o contrato descreveria a URL sozinho, mas a mudança tocaria cerca de 330 chamadas de teste e a collection, sem ganho funcional para a v1.
- **Host separado para a API (`finances-api.<env>…`):** exigiria CORS e duas entradas de DNS, contra a mesma origem do ADR-0001.
