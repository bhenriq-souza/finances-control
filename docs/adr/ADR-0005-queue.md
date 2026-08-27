# ADR-0005 — Eventos de domínio e trabalho assíncrono

- Status: **accepted**
- Data: 2026-08-27

## Context

O registro original (ADR05 "Queue") ficou vazio. A motivação inicial para adotar mensageria era emitir eventos entre serviços — por exemplo, um evento de atualização de saldo após a inclusão de uma despesa.

A análise separou três conceitos que estavam sobrepostos:

- **Evento de domínio** — conceito de modelagem: algo relevante aconteceu no negócio (`ExpenseCreated`, `StatementClosed`).
- **Fila / broker** — infraestrutura de transporte e execução diferida.
- **Microservice** — unidade independente de deploy (tratado no [ADR-0003](ADR-0003-architecture-style.md)).

É possível ter o primeiro sem os outros dois. E, no caso específico da atualização de saldo, o processamento assíncrono é **prejudicial**: saldo e limite disponível são invariantes exigidas pelos requisitos F002/F003, e diferi-las abre janela para decisões tomadas sobre dados incorretos — duas despesas concorrentes validando contra o mesmo limite desatualizado.

Mapeando o trabalho genuinamente assíncrono do domínio, nota-se que a maior parte é **agendamento**, não mensageria reativa:

| Trabalho | Requisito | Natureza |
|---|---|---|
| Importação de CSV | F002/F003/F005 | Job sob demanda, longo |
| Transição Aberto → Vencido | F003/F005 | Job agendado (diário) |
| Fechamento de fatura no dia de fechamento | F004 | Job agendado |
| Geração de despesas/receitas fixas mensais | F003/F005 | Job agendado |
| Notificações (futuro) | — | Evento reativo |

## Decision

### 1. Nenhuma invariante financeira depende de processamento assíncrono

Saldo de conta, limite disponível de cartão e geração de parcelas são resolvidos de forma síncrona e transacional (ver regra 4 do [ADR-0003](ADR-0003-architecture-style.md)). Esta regra é normativa e tem precedência sobre qualquer conveniência de desacoplamento.

### 2. Eventos de domínio existem desde o início, despachados in-process

Os módulos publicam eventos de domínio (`ExpenseCreated`, `ExpensePaid`, `StatementClosed`, …) através de uma interface de dispatcher da camada `platform`. A implementação inicial é **in-process**, executada após o commit da transação que originou o evento. Consumidores são handlers registrados pelos módulos.

O valor está na interface: o contrato do dispatcher não muda quando a entrega passar a ser diferida ou remota.

### 3. Trabalho assíncrono usa `pg-boss` sobre o PostgreSQL existente

Quando o primeiro trabalho assíncrono real chegar (importação de CSV e os jobs agendados da tabela acima), a execução será feita com **`pg-boss`**, que implementa filas, retentativas e agendamento cron **dentro do próprio PostgreSQL** já provisionado no cluster.

Isso entrega enfileiramento e agendamento reais **sem adicionar infraestrutura nova** ao cluster single-node — sem StatefulSet, PVC, backup e observabilidade adicionais — e com enfileiramento transacionalmente consistente com os dados de negócio.

### 4. Outbox quando houver consumidor fora da transação

Enquanto todos os consumidores forem in-process, o dispatch pós-commit é suficiente. No momento em que existir consumidor assíncrono ou externo cujo processamento não possa ser perdido, adota-se o **padrão outbox**: o evento é gravado numa tabela `outbox` na mesma transação do lançamento, e um dispatcher a consome e entrega. A mudança fica contida na implementação do dispatcher.

### 5. Broker dedicado permanece adiado

A adoção de um broker dedicado (candidato preferencial: **BullMQ + Redis**, pelo alinhamento com TypeScript e pelo peso adequado a single-node) exige novo ADR e só se justifica mediante um destes gatilhos:

1. Volume ou latência de jobs que o `pg-boss` comprovadamente não atenda;
2. Consumidor fora do processo principal, após extração de serviço (gatilhos do ADR-0003);
3. Necessidade de fan-out para múltiplos consumidores independentes com retenção/replay;
4. Contenção mensurável no PostgreSQL causada pela carga de filas.

RabbitMQ e Kafka são considerados desproporcionais ao contexto (usuário único, cluster doméstico single-node).

## Consequences

- O domínio ganha vocabulário de eventos desde o dia 1, sem custo de infraestrutura e sem risco de inconsistência nas invariantes financeiras.
- O caminho evolutivo é incremental e localizado: in-process → `pg-boss` → outbox → broker dedicado, cada passo com gatilho explícito.
- O PostgreSQL passa a acumular também o papel de fila — aceitável na escala prevista, e monitorável (é um gatilho de revisão, item 4 acima).
- Jobs agendados no `pg-boss` (em vez de `CronJob` do Kubernetes) mantêm a lógica de negócio no código da aplicação, versionada e testável, em vez de espalhada em manifests.

## Alternatives considered

- **Broker dedicado desde o início (Redis/BullMQ)**: infraestrutura, backup e observabilidade adicionais num single-node, para uma carga que ainda não existe.
- **RabbitMQ / Kafka**: garantias de entrega e throughput muito além da necessidade; custo operacional incompatível com o cluster.
- **`CronJob` do Kubernetes para os jobs agendados**: viável, mas divide a lógica de negócio entre código e manifests do GitOps, dificultando teste e rastreabilidade por spec.
- **Nenhum mecanismo assíncrono**: inviabiliza a importação de CSV (F002/F003/F005) e as transições de status por tempo.
