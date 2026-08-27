# Resumo da Arquitetura do Cluster K3s Homelab

> Snapshot de 2026-08 para contexto deste projeto. A fonte de verdade da infra é o [homelab-infra](https://github.com/bhenriq-souza/homelab-infra) (Terraform/ADRs) e o [homelab-gitops](https://github.com/bhenriq-souza/homelab-gitops) (estado dos deploys, ver `CLUSTER-STATUS.md` lá).

## Infraestrutura

- **Host**: Mini PC single-node com Ubuntu Server 24.04 LTS
- **Kubernetes**: K3s single-node
- **Rede**: domínio `.homelab.local`, acesso restrito à rede `192.168.15.0/24`
- **GitOps**: Argo CD com app-of-apps pattern, sync automático com prune e self-heal

## Componentes de Plataforma

| Componente | Namespace | Detalhes |
|---|---|---|
| **Traefik** | `kube-system` | Ingress embutido no K3s, porta TCP 5432 exposta |
| **Argo CD** | `argocd` | Bootstrap GitOps, 5 Applications gerenciadas |
| **External Secrets Operator** | `external-secrets` | v0.20.4, integrado com GCP Secret Manager (dev/prd) |
| **Prometheus** | `observability` | kube-prometheus-stack v58.7.2, retenção 2 dias, 8Gi PVC |
| **Grafana** | `observability` | `grafana.homelab.local`, datasources Prometheus + Loki |
| **Loki** | `observability` | v6.16.0, single-binary, retenção 7 dias, 10Gi PVC |
| **Alloy** | `observability` | DaemonSet de coleta de logs, forward para Loki |

## Workloads

### Dev (`dev-apps`)

- **MyApp** — app custom (imagem do GCP Artifact Registry), ingress em `myapp.dev.homelab.local`
- **PostgreSQL 16** — StatefulSet com 8Gi PVC, porta 5432 exposta via Traefik

### Prd (`prd-apps`)

- Apenas placeholders de infraestrutura, sem workloads ativos ainda.

## CI/CD

- GitHub Actions com Workload Identity Federation (OIDC) → GCP Artifact Registry
- Branch `develop` → imagens dev, `main` → imagens prd
- Tags: commit SHA + semver em releases

## Fase Atual do Roadmap

- **Fases 0–5 concluídas** (arquitetura, OS, rede, K3s, Argo CD, observabilidade)
- **Fase 6–7 em andamento** (logs centralizados com Loki/Alloy, pipeline CI/CD)
- **Próximos passos**: finalizar CI/CD, promover workloads para prd, e provisionar K3s no ai-lab (GCP)

## Validação dos Componentes

| Componente | Status | Detalhes |
|---|---|---|
| K3s Cluster | ✅ Operacional | Single-node, Ubuntu 24.04 |
| Traefik Ingress | ✅ Configurado | Restrito a 192.168.15.0/24 |
| Prometheus | ✅ Deployed | 8Gi storage, retenção 2 dias |
| Grafana | ✅ Acessível | `grafana.homelab.local` |
| Loki | ✅ Deployed | Retenção 7 dias, 10Gi storage |
| Alloy | ✅ Running | Coleta de logs de pods ativa |
| Argo CD | ✅ Bootstrapped | Auto-sync app-of-apps |
| ESO | ✅ Configurado | Integração GCP Secret Manager |
| Artifact Registry | ✅ Provisionado | Auth OIDC pronta para CI/CD |
| PostgreSQL (dev) | ✅ Running | 8Gi PVC, pronto para apps |
| MyApp (dev) | ✅ Deployed | Pulling do Artifact Registry |
