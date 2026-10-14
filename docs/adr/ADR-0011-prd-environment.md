# ADR-0011 — Ambiente `prd` no homelab

- Status: **accepted**
- Data: 2026-10-14
- Completa o [ADR-0000](ADR-0000-hosting.md) (hospedagem no K3s do homelab) e o
  [ADR-0010](ADR-0010-firebase-project-dev.md), que deixou o projeto Firebase de `prd` para a Fase 4.

## Context

As Fases 3 e 3.1 terminaram com o sistema inteiro publicado em `dev`, testado pelo responsável.
A Fase 4 promove o sistema a `prd`, com os dados reais da família no lugar da planilha
`cashflow 2025-2026`.

O cluster é um K3s de um nó só, no mini PC `hlb-beelink01` (4 CPUs, 16 GB de RAM, disco de
465 GiB). Em 2026-10-14, o nó usava 7% de CPU e 36% de memória, e o sistema inteiro em `dev`
(backend, frontend e PostgreSQL) ocupava cerca de 370 Mi. O namespace `prd-apps` já existe, com o
pull do Artifact Registry e o `ClusterSecretStore` `gcp-prd`, mas sem nenhuma aplicação.

O responsável decidiu, em 2026-10-14, que `prd` fica só na rede de casa, sem endereço externo.

## Decision

- **`prd` roda no mesmo cluster**, no namespace `prd-apps`, com os mesmos manifests de `dev`
  adaptados: backend, frontend e um **PostgreSQL próprio**, separado do de `dev`.
- **Dois endereços, como em `dev`:** um em `homelab.local`, para o navegador do computador, e um em
  `nip.io`, para o celular, porque o roteador não resolve `homelab.local`. Os dois precisam estar
  nos domínios autorizados do Firebase de `prd`.
- **Projeto Firebase próprio para `prd`**, separado do `dev-financial-control`: contas de teste e
  mudanças de configuração em `dev` não alcançam `prd`. A chave da service account fica no Secret
  Manager do `homelab-492918`, como em `dev`.
- **Promoção:** `prd` recebe o que está em `main`. O merge de `develop` em `main`, feito pelo
  responsável depois do CI verde, é o portão de promoção. Uma checagem de fumaça depois do sync do
  Argo CD confirma o `/health` do backend e a página inicial do frontend.
- **Backup antes dos dados reais:** `pg_dump` diário por CronJob, com uma cópia em `/data/backups`
  no próprio mini PC e outra na pasta `backups` do Google Drive do responsável. Uma restauração é
  testada antes da carga.
- **Carga inicial pela planilha `finances-control - carga inicial prd`**, no Drive do responsável,
  e não por dados versionados: os dados financeiros da família não entram em repositório nenhum.

## Consequences

- `dev` e `prd` dividem o mesmo nó. Um teste pesado em `dev` pode afetar `prd`, o que com o uso de
  hoje é desprezível; se o mini PC parar, os dois param.
- A cópia de backup no mini PC protege contra erro de operação, não contra perda do disco. A cópia
  no Drive cobre esse caso.
- O Drive exige um token OAuth da conta pessoal do responsável, guardado no Secret Manager. Service
  account do GCP não tem cota no Drive pessoal.
- O backend ainda não tem `main`; o frontend tem, 199 commits atrás de `develop`. As duas precisam
  existir antes da primeira promoção.
- A planilha da carga é também o modelo da futura importação por CSV.

## Alternatives considered

- **Mesmo projeto Firebase de `dev`:** menos um projeto para administrar, mas usuários e
  configuração de teste se misturariam com os reais.
- **Backup no SSD `/data` do ai-lab:** está fora do mini PC, mas é outra máquina da mesma casa e
  exigiria compartilhar o disco por rede com o cluster. O Drive dá uma cópia fora de casa sem infra
  nova.
- **Carga por migration ou seed versionado:** reprodutível, mas publicaria os dados financeiros da
  família no Git.
