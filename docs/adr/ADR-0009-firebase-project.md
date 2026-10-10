# ADR-0009 — Projeto Firebase `homelab-492918` e email verificado

- Status: **accepted**
- Data: 2026-10-10
- Substitui, no [ADR-0006](ADR-0006-auth.md), a decisão "Projeto Firebase reaproveitado" e a
  alternativa rejeitada "Projeto Firebase novo"

## Context

O [ADR-0006](ADR-0006-auth.md) reaproveitou o projeto Firebase do `control-backend`
(`financial-control-472211`). A FC-008 mostrou que esse projeto não tinha o provedor Google nem o
domínio da plataforma autorizado, ao contrário do que o ADR-0006 supunha.

O cluster, o Artifact Registry, o Secret Manager e a federação de identidade do CI já vivem no
projeto GCP `homelab-492918`, da conta pessoal do responsável.

O backend v1 também promove a `ADMIN` o email de bootstrap sem conferir se o email foi verificado.
Um cadastro por email e senha com aquele endereço, ainda não verificado, ganharia o perfil.

## Decision

- **O Firebase Authentication da plataforma vive no projeto `homelab-492918`.** O responsável
  ativou o Firebase nele em 2026-10-10.
    - Os provedores são email/senha e Google, como no ADR-0006.
    - A service account do `firebase-admin` e a web config do frontend saem desse projeto.
    - O `financial-control-472211` deixa de ser usado pela plataforma.
- **Email verificado como condição:**
    - para o bootstrap do primeiro Admin;
    - para re-vincular um usuário existente a um novo UID do Firebase, quando o email bate.
- **O re-vínculo é o mecanismo da troca de projeto.** Os UIDs mudam, os usuários continuam: quem
  entra pelo projeto novo com o mesmo email verificado reassume a sua linha, com perfil e histórico.
- **Detalhe:** na [spec 0010 do backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0010-identity.md),
  revisada em 2026-10-10 (T-0010-07 e T-0010-08).

## Consequences

- Um projeto GCP só para administrar: IAM, Secret Manager e Firebase no mesmo lugar.
- **Configuração de console, sem infraestrutura como código** (FC-008):
    - os provedores;
    - os domínios autorizados;
    - o app Web;
    - a chave da service account.
- **Cadastro por email e senha precisa do email confirmado** para que o usuário reassuma uma conta
  existente ou receba o bootstrap. Qualquer outro acesso continua dependendo só da aprovação de
  um Admin. O frontend envia o email de verificação no cadastro.

## Alternatives considered

- **Continuar no `financial-control-472211`:** exigiria as mesmas configurações de console num
  projeto fora do `homelab-492918`, com IAM e cobrança separados.
- **Migrar os usuários pela API de importação do Firebase, preservando os UIDs:** resolve a troca
  sem tocar o backend, mas exige exportar hashes de senha. O re-vínculo por email verificado é mais
  simples e também cobre um usuário que apague e recrie a conta.
