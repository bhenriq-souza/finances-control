# ADR-0003 — Estilo arquitetural: monolito modular

- Status: **accepted**
- Data: 2026-08-27

## Context

O registro original (ADR03 "Microservices") ficou vazio. A hipótese inicial era adotar microservices, por dois motivos: a percepção de que o produto teria "serviços de naturezas bem distintas", e a necessidade de emitir eventos entre eles (ex.: atualizar o saldo após incluir uma despesa).

A análise dessa hipótese contra o domínio e a infraestrutura reais apontou:

**O domínio é fortemente entrelaçado.** No modelo de dados, `Expenses` referencia `BankAccount`, `CreditCard`, `User`, `ExpenseType` e `EntryStatus`; `CreditCardStatements` referencia `Expenses`; `Earning` referencia `BankAccount`. As perguntas centrais do produto atravessam qualquer fronteira que se desenhe: "qual meu saldo previsto?" cruza contas, despesas e receitas; "resumo da fatura?" cruza cartão, despesas e fatura. Serviços que precisam de JOIN entre suas tabelas para responder perguntas básicas não são serviços separados.

**As invariantes do produto são transacionais.** Saldo de conta e limite disponível de cartão não são efeitos colaterais que toleram atraso — os requisitos F002/F003 exigem que a despesa reflita no saldo/limite. Consistência eventual aqui permite que duas despesas concorrentes validem contra o mesmo limite desatualizado e estourem o cartão. A criação automática de parcelas (F003) é atômica por natureza: num processo único é uma transação; distribuída, vira saga com compensação.

**As restrições operacionais são concretas.** Cluster K3s **single-node** (Beelink), com pods no padrão de ~50m CPU / 128Mi. O pipeline exige **1 app-name = 1 deployment = 1 caller workflow = 1 diretório no GitOps = 1 registro no WIF**, e **nunca foi validado ponta a ponta**. O time é uma pessoa somada a agentes de IA. Existe hoje um único database, com a estratégia de segregação ainda por definir.

## Decision

O sistema será um **monolito modular**: um único processo deployável, organizado internamente em módulos por contexto de negócio, com fronteiras explícitas e verificadas automaticamente.

### Módulos

| Módulo | Responsabilidade | Requisito |
|---|---|---|
| `identity` | Usuários, autenticação, perfis e RBAC | F001 |
| `accounts` | Bancos, contas bancárias e cartões de crédito | F002 |
| `expenses` | Despesas, tipos, parcelamento e status | F003 |
| `statements` | Faturas de cartão de crédito | F004 |
| `earnings` | Receitas, tipos e status | F005 |
| `reporting` | Saldo previsto, resumos e relatórios | F002/F004 |
| `imports` | Importação de CSV | F002/F003/F005 |
| `platform` | Infra transversal: config, DB, logging, erros, dispatcher de eventos | — |

### Regras de fronteira (normativas)

1. Um módulo só é acessado pela sua **interface pública** (barrel `index.ts`). Import profundo em arquivo interno de outro módulo é proibido.
2. Um módulo **não acessa repositórios nem entidades de persistência de outro**. Leitura entre módulos ocorre via serviço público ou via read-model dedicado.
3. Efeitos entre módulos que **não** são invariantes de negócio são comunicados por **evento de domínio** (ver [ADR-0005](ADR-0005-queue.md)).
4. **Invariantes financeiras resolvem-se na mesma transação.** Saldo e limite disponível nunca dependem de processamento assíncrono. A abordagem preferencial é ledger: lançamentos imutáveis com saldo derivado por agregação (com snapshot se a performance exigir); se materializado, o update ocorre na mesma transação do lançamento, com lock de linha.
5. `reporting` é o único módulo autorizado a ler de múltiplos contextos — é read-model por natureza, e só faz leitura.
6. As regras 1–3 são verificadas por **gate automatizado** (`dependency-cruiser`, ou `eslint-plugin-boundaries`), executado pelo orquestrador único de quality gates e, portanto, também no CI.

### Gatilhos objetivos para extrair um serviço

A extração de um módulo para processo/deployment próprio é justificada quando **pelo menos um** ocorrer, e deve ser registrada em novo ADR:

1. Importação de CSV bloqueando requisição acima de ~30s ou exigindo escala independente (**candidato natural a ser o primeiro**);
2. Um módulo precisando de cadência de deploy ou perfil de escala distinto dos demais;
3. Contenção de recursos mensurável no cluster atribuível a um módulo;
4. Necessidade de runtime ou linguagem diferente para um componente.

Enquanto nenhum gatilho ocorrer, o sistema permanece em processo único.

## Consequences

- Invariantes de saldo, limite e parcelamento ficam garantidas por transação ACID, sem saga, compensação ou reconciliação.
- Um único pipeline a validar e um único deployment no cluster single-node — coerente com a Fase 1 do roadmap, que estreia o CI/CD do homelab.
- O custo da modularidade migra do runtime para o *design*: as fronteiras precisam ser mantidas por disciplina e pelo gate automatizado, sob risco de virar um monolito emaranhado.
- A extração futura de um serviço fica barata **na medida em que as regras 1–3 forem respeitadas** — o gate é o que preserva essa opção.
- Frontend e backend permanecem deployments separados, por exigência do pipeline (ver [ADR-0000](ADR-0000-hosting.md)) — isso é topologia de entrega, não microservices.

## Alternatives considered

- **Microservices desde o início**: resolveria escala independente e autonomia de times — problemas que o projeto não tem — ao custo de criar consistência distribuída num domínio onde a consistência é o produto. Multiplicaria por ~6 o overhead de pipeline, manifests e pods num cluster single-node cujo CI/CD ainda não rodou uma vez.
- **Monolito sem fronteiras internas**: mais rápido no curtíssimo prazo, mas elimina a opção de extrair um serviço quando um gatilho real aparecer.
