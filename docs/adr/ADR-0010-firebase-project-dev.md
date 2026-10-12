# ADR-0010 — Projeto Firebase `dev-financial-control`

- Status: **accepted**
- Data: 2026-10-12
- Substitui, no [ADR-0009](ADR-0009-firebase-project.md), a decisão "O Firebase Authentication da plataforma vive no projeto `homelab-492918`" e a consequência "um projeto GCP só para administrar". A condição de email verificado do ADR-0009 continua valendo.

## Context

O [ADR-0009](ADR-0009-firebase-project.md) foi aceito em 2026-10-10 dizendo que o Firebase
Authentication da plataforma viveria no projeto GCP `homelab-492918`. No mesmo levantamento, o
responsável corrigiu a decisão: ele tinha confundido o projeto Firebase com o projeto GCP do cluster.
O projeto escolhido de fato foi um projeto Firebase próprio, o **`dev-financial-control`**, da
conta pessoal do responsável.

Tudo o que foi executado depois já usa o `dev-financial-control`:

- a FC-008 configurou nele os provedores email/senha e Google, o domínio
  `finances.dev.homelab.local` e o app Web `finances-frontend`;
- a [spec 0010 do backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0010-identity.md)
  e a T-0010-08 puseram `dev` nele (`FIREBASE_PROJECT_ID=dev-financial-control`);
- o roadmap da Fase 3 já o cita.

O texto do ADR-0009 ficou divergente do que está em produção em `dev`. Como ADR aceito é imutável,
a correção vem neste ADR.

## Decision

- **O Firebase Authentication de `dev` vive no projeto `dev-financial-control`**, separado do
  `homelab-492918`.
    - Provedores email/senha e Google; domínio autorizado `finances.dev.homelab.local`.
    - App Web `finances-frontend` (appId `1:805955182517:web:652d21a187283fa505c3fc`), cuja web
      config o frontend recebe em runtime.
    - A service account do `firebase-admin` é desse projeto.
- **A chave da service account continua no Secret Manager do `homelab-492918`**, como versão 2 de
  `homelab-dev-finances-firebase-service-account`, entregue ao pod por ExternalSecret: os segredos
  da plataforma ficam num lugar só, ainda que o Firebase não.
- **O `financial-control-472211` deixa de ser usado**, como já dizia o ADR-0009.
- **Email verificado** para o bootstrap e para o re-vínculo: sem mudança em relação ao ADR-0009.

## Consequences

- Dois projetos GCP a administrar: `homelab-492918` (cluster, Artifact Registry, Secret Manager,
  federação do CI) e `dev-financial-control` (só Firebase). O IAM e a cobrança do Firebase ficam
  separados dos do cluster.
- O prefixo `dev-` deixa espaço para um projeto Firebase de `prd`; a decisão fica para a Fase 4.
- O ADR-0009 continua aceito no que não foi substituído: email verificado e re-vínculo por email.

## Alternatives considered

- **Corrigir o ADR-0009 no lugar:** mais curto, mas fere a regra de imutabilidade dos ADRs aceitos e
  apaga o registro de que a decisão mudou.
- **Mover o Firebase para o `homelab-492918`, como o ADR-0009 dizia:** desfaria a FC-008 e a
  T-0010-08 já executadas, sem ganho funcional.
