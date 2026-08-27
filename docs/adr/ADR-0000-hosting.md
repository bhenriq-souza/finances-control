# ADR-0000 — Hospedagem no cluster K3s homelab

- Status: **accepted**
- Data: 2026-08 (registro original: ADR00 nos docs iniciais)

## Context

O usuário mantém um cluster K3s single-node (server Beelink, Ubuntu 24.04) com GitOps via Argo CD, observabilidade (Prometheus/Grafana/Loki/Alloy), External Secrets Operator integrado ao GCP Secret Manager e PostgreSQL 16 disponível em `dev-apps`. Ver [infra/cluster-status.md](../infra/cluster-status.md).

## Decision

- As apps do Finances Control serão hospedadas no cluster K3s homelab existente.
- O deploy utilizará o fluxo CI/CD existente do `homelab-gitops` (GitHub Actions + WIF/OIDC → Artifact Registry → Argo CD).

## Consequences

- Custo zero de hospedagem; acesso restrito à rede local `192.168.15.0/24`.
- O projeto será o primeiro a validar o pipeline de CI/CD ponta a ponta (risco e oportunidade — ver Fase 1 do [roadmap](../roadmap.md)).
- Restrições do cluster single-node: requests/limits conservadores (~50m CPU / 96–128Mi).
- Frontend e backend precisam de app-names/manifests separados (limitação do reusable workflow: 1 app-name = 1 deployment).

## Alternatives considered

- Cloud pública (GCP/AWS): custo recorrente desnecessário para uso pessoal; o homelab já existe e é também objetivo de aprendizado.
