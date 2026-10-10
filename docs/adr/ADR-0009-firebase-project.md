# ADR-0009 — Projeto Firebase `dev-financial-control` e email verificado

- Status: **accepted**
- Data: 2026-10-10
- Substitui, no [ADR-0006](ADR-0006-auth.md), a decisão "Projeto Firebase reaproveitado" e a
  alternativa rejeitada "Projeto Firebase novo"

## Context

O [ADR-0006](ADR-0006-auth.md) reaproveitou o projeto Firebase do `control-backend`
(`financial-control-472211`). A FC-008 mostrou que esse projeto não tinha o provedor Google nem o
domínio da plataforma autorizado, ao contrário do que o ADR-0006 supunha.

Para não herdar a configuração e os usuários de outra aplicação, o responsável criou em
2026-10-10, na sua conta pessoal, um projeto Firebase próprio da plataforma: o
`dev-financial-control`. Ele tem um projeto GCP de mesmo nome, separado do `homelab-492918`, onde
vivem o cluster, o Artifact Registry e o Secret Manager.

O backend v1 também promove a `ADMIN` o email de bootstrap sem conferir se o email foi verificado.
Um cadastro por email e senha com aquele endereço, ainda não verificado, ganharia o perfil.

## Decision

- **O Firebase Authentication de `dev` vive no projeto `dev-financial-control`.**
    - Os provedores são email/senha e Google, como no ADR-0006.
    - A service account do `firebase-admin` e a web config do frontend saem desse projeto.
    - O `financial-control-472211` deixa de ser usado pela plataforma.
- **A credencial do `firebase-admin`** continua no Secret Manager do `homelab-492918`, como nova
  versão de `homelab-dev-finances-firebase-service-account`, entregue por ExternalSecret.
- **Email verificado como condição:**
    - para o bootstrap do primeiro Admin;
    - para re-vincular um usuário existente a um novo UID do Firebase, quando o email bate.
- **O re-vínculo é o mecanismo da troca de projeto.** Os UIDs mudam, os usuários continuam: quem
  entra pelo projeto novo com o mesmo email verificado reassume a sua linha, com perfil e histórico.
- **Detalhe:** na [spec 0010 do backend](https://github.com/bhenriq-souza/finances-control-backend/blob/develop/specs/0010-identity.md),
  revisada em 2026-10-10 (T-0010-07 e T-0010-08).

## Consequences

- Os usuários da plataforma ficam isolados dos de qualquer outra aplicação.
- O projeto de identidade é separado do projeto do cluster: o Firebase tem IAM e console próprios,
  e o vínculo com o cluster é só a chave guardada no Secret Manager.
- O nome do projeto diz `dev`. Se prd terá um projeto Firebase próprio (`prd-financial-control`)
  ou usará o mesmo fica para a Fase 4, junto do host de prd.
- **Configuração de console, sem infraestrutura como código** (FC-008):
    - os provedores;
    - os domínios autorizados;
    - o app Web;
    - a chave da service account.
- **Cadastro por email e senha precisa do email confirmado** para que o usuário reassuma uma conta
  existente ou receba o bootstrap. Qualquer outro acesso continua dependendo só da aprovação de
  um Admin. O frontend envia o email de verificação no cadastro.

## Alternatives considered

- **Continuar no `financial-control-472211`:** compartilharia usuários e configuração com o
  `control-backend`, e ainda exigiria as mesmas configurações de console.
- **Firebase dentro do `homelab-492918`:** um projeto GCP a menos, mas mistura a identidade dos
  usuários com a infraestrutura do cluster. O responsável optou pelo projeto próprio.
- **Migrar os usuários pela API de importação do Firebase, preservando os UIDs:** resolve a troca
  sem tocar o backend, mas exige exportar hashes de senha. O re-vínculo por email verificado é mais
  simples e também cobre um usuário que apague e recrie a conta.
