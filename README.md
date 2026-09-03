# Finances Control

Plataforma de controle financeiro pessoal: gestão de despesas, receitas, contas bancárias, cartões de crédito e faturas, com orçamentos e relatórios, acessível via web.

Este é o **repositório hub** do produto: concentra requisitos, decisões de arquitetura (ADRs), roadmap e backlog de alto nível. O código vive em repositórios próprios.

## Repositórios do projeto

| Repositório | Papel |
|---|---|
| [finances-control](https://github.com/bhenriq-souza/finances-control) | Hub — requisitos, ADRs, roadmap, wiki, board |
| [finances-control-backend](https://github.com/bhenriq-souza/finances-control-backend) | API backend (Node.js + TypeScript + Express 5 + TypeORM/PostgreSQL) |
| `finances-control-frontend` | A criar — SPA React 19 + Vite, decidida no [ADR-0001](docs/adr/ADR-0001-frontend.md) |
| [homelab-gitops](https://github.com/bhenriq-souza/homelab-gitops) | Estado desejado dos deploys (Argo CD) no cluster K3s homelab |
| [typescript-common-packages](https://github.com/bhenriq-souza/typescript-common-packages) | Pacotes `@bhs-dev/*` reutilizados pelo backend |

> O repositório [control-backend](https://github.com/bhenriq-souza/control-backend) (Express 5 + MongoDB + Firebase Auth, 2025) fica como **referência histórica** — foi substituído pelo `finances-control-backend` conforme o [ADR-0002](docs/adr/ADR-0002-backend.md).

## Documentação

- [Requisitos de negócio](docs/business-requirements.md) — funcionalidades F001–F005
- [Análise da planilha legada](docs/legacy-spreadsheet-analysis.md) — dinâmicas e evidências extraídas do sistema em uso, insumo da Fase 2
- [Perfis de usuário](docs/user-profiles.md) — Admin, Biller, Viewer
- [Modelo de dados](docs/assets/billing-control-database-schema.jpg) — diagrama inicial
- [ADRs](docs/adr/README.md) — decisões de arquitetura
- [Requisitos de CI/CD](docs/cicd-requirements.md)
- [Infraestrutura (cluster homelab)](docs/infra/cluster-status.md)
- [Roadmap](docs/roadmap.md) — fases com Definition of Done
- [Backlog](docs/backlog.md) — fila de trabalho (espelhada no board)

## Método de trabalho

O projeto segue **desenvolvimento agentic-driven**: specs normativas escritas antes do código, backlog como fila de tarefas rastreáveis, implementação por agentes de IA (Claude Code) e **merge sempre humano**. O manual do método é instalado em cada repositório de código via `AGENTS.md`; o resumo está na [wiki](../../wiki).
