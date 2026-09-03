# ADR-0006 — Autenticação: Firebase Auth

- Status: **accepted**
- Data: 2026-09-03

## Context

F001 exige cadastro com email/senha **e** login social com Google, com segurança de credenciais, e concessão de privilégios (Admin/Biller/Viewer) feita pelo administrador. O `control-backend` (2025) já implementou verificação de token via **Firebase Auth** (`firebase-admin`, middleware `verifyToken`), num projeto Firebase que continua existindo. Não há pacote `@bhs-dev` de auth nem previsão dele no monorepo de commons.

O [ADR-0001](ADR-0001-frontend.md) assumiu o Firebase JS SDK no cliente, com o ID token no header `Authorization` de toda chamada. A plataforma roda em rede local, sem TLS ([ADR-0000](ADR-0000-hosting.md)).

## Decision

- **Identidade delegada ao Firebase Authentication**, com os provedores email/senha e Google. A plataforma não custodia senhas nem implementa reset.
- **Projeto Firebase reaproveitado**: o mesmo usado pelo `control-backend`. O identificador do projeto e a web config vivem em configuração de ambiente, não neste ADR.
- **Backend valida o ID token** a cada requisição com `firebase-admin` (portando o padrão `verifyToken` do `control-backend`) e mantém tabelas próprias `User`/`UserProfile`, vinculadas ao UID do Firebase. Não há sessão própria nem refresh no backend: o SDK renova o token (validade de 1h) e o backend só verifica assinatura e expiração.
- **Papel lido do banco a cada requisição**, não de custom claims do Firebase. Conceder ou remover um perfil tem efeito imediato e o RBAC continua local e testável.
- **Usuário recém-cadastrado não recebe perfil**: existe como `User` pendente, sem acesso a qualquer recurso de domínio, até que um Admin lhe conceda um perfil. A resposta a esse estado é um erro próprio, definido na spec de identity.
- **Bootstrap do primeiro Admin**: o email do administrador inicial vem de secret de ambiente (GCP Secret Manager + ExternalSecret, convenção `homelab-{env}-finances-…`). O primeiro login com esse email cria o `User` já com perfil `ADMIN`. O mecanismo é idempotente e só promove — nunca rebaixa nem cria um segundo bootstrap.
- **Credencial do `firebase-admin`** (service account JSON) vive no GCP Secret Manager e chega ao pod via ExternalSecret; nunca no repositório nem em imagem.
- **Domínios autorizados no Firebase**: `finances.dev.homelab.local` e o host de prd, ambos servidos em HTTP.

## Consequences

- Menos superfície de segurança própria: sem hash de senha, sem fluxo de reset, sem sessão.
- Dependência do Google, aceitável: login Google já é requisito de F001.
- Dois secrets novos a provisionar antes da FCB-007 (spec de identity): service account do `firebase-admin` e email do Admin de bootstrap.
- Acesso a dados financeiros exige aprovação explícita de um Admin — um cadastro pelo Google não dá visibilidade a nada por si só.
- **Risco a validar em spike, antes da spec de login do frontend**: o fluxo de popup/redirect do Google numa origem HTTP fora de `localhost`. Registrado na Definition of Done da Fase 3 do [roadmap](../roadmap.md).
- O backend precisa de acesso de saída às chaves públicas do Google para verificar tokens (`firebase-admin` faz cache); fica registrado como dependência de rede do pod.

## Alternatives considered

- **Auth própria (JWT + bcrypt)**: mais controle, muito mais superfície de risco e trabalho — senha, reset, rotação, rate limit.
- **Keycloak/Ory no cluster**: peso operacional excessivo para single-node e um único tenant.
- **Projeto Firebase novo**: nenhum ganho que justifique um segundo projeto para administrar; o existente já tem os provedores configurados.
- **Papéis em custom claims do Firebase**: evitaria uma leitura por requisição, mas a revogação levaria até 1h (validade do token) e o RBAC sairia do domínio da aplicação.
- **Perfil `VIEWER` automático no cadastro**: comodidade de onboarding, rejeitada — daria acesso a dados financeiros sem decisão humana.
