# Requisitos de CI/CD

## Requisitos funcionais

- Toda app customizada deve ser empacotada como imagem Docker/OCI.
- O código-fonte deve permanecer no GitHub e disparar CI por push e pull request.
- O pipeline deve buildar e publicar imagens privadas no GCP Artifact Registry.
- O deploy no K3s deve ocorrer via Argo CD a partir do repositório GitOps ([homelab-gitops](https://github.com/bhenriq-souza/homelab-gitops)).
- Deve haver segregação por ambiente, refletindo a estrutura atual `dev-apps` e `prd-apps`.

## Requisitos de segurança

- O GitHub Actions deve autenticar no GCP via OIDC / Workload Identity Federation, sem armazenar chave JSON estática no GitHub.
- O cluster K3s deve ter autenticação dedicada apenas para pull de imagens privadas do Artifact Registry.
- Segredos de runtime da aplicação não devem ficar no repositório — continuar no modelo GCP Secret Manager + External Secrets Operator já adotado no cluster.

## Requisitos operacionais

- A imagem deve ser versionada ao menos por commit SHA e, quando fizer sentido, por semver também.
- O rollback deve poder ser feito por revert de Git no repositório GitOps ou retorno explícito para uma tag anterior.
- O pipeline deve ser reutilizável entre múltiplas apps — já existe o reusable workflow `bhenriq-souza/homelab-gitops/.github/workflows/docker-build-push.yaml`.

## Estado atual (2026-08)

O reusable workflow existe, mas **nunca foi validado ponta a ponta** por um app repo real (a imagem do `myapp` de teste foi publicada manualmente). O `finances-control-backend` será a primeira app real a exercitar o pipeline — ver [roadmap](roadmap.md), Fase 1.

Armadilhas conhecidas do pipeline/cluster estão documentadas em [infra/cluster-status.md](infra/cluster-status.md).
