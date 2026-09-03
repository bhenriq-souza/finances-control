# Análise da planilha legada — insumo para a Fase 2

- Data: 2026-09-03
- Fonte: `cashflow 2025-2026` (Google Sheets), export XLSX
- Método: leitura das fórmulas via `openpyxl` sobre o export, incluindo as funções exclusivas do Google Sheets preservadas em `__xludf.DUMMYFUNCTION`

## 1. Por que este documento existe

A planilha `cashflow 2025-2026` não é um rascunho: é o **sistema de controle financeiro em uso**, alimentado desde outubro de 2024, e implementa — em fórmula — boa parte do que os [requisitos de negócio](business-requirements.md) descrevem em prosa. Ela é, na prática, o protótipo funcional do produto.

Isso a torna a melhor fonte disponível de requisitos validados para a Fase 2 do [roadmap](roadmap.md), que ainda não começou: as regras que sobreviveram a dois anos de uso real estão nela, e os pontos onde ela falha são evidência empírica para decisões de design que os ADRs tomaram no papel.

> Escopo: este documento registra o que é **aproveitável** e o que serve de **evidência**. Funcionalidades presentes na planilha que não farão parte do produto foram deliberadamente omitidas.

### Volume e formato

| Item | Quantidade |
|---|---|
| Abas | 17 |
| Lançamentos de extrato bancário | 530 |
| Recebíveis | 998 (711 Aberto, 287 Pago) |
| Despesas | 263 (136 Pago, 127 Aberto) |
| Registros em faturas de cartão | 492 (Santander 180, Nubank 235, BV 77) |
| Contas bancárias cadastradas | 12 |
| Cartões cadastrados | 8 (4 com aba própria) |
| Tipos de despesa | 19 |

### Arquitetura em quatro camadas

O grafo de dependências entre abas fecha em um pipeline único:

```
cartão-detalhado ──QUERY+ARRAYFORMULA──▶ cartão-resumido ──ref direta──▶ despesas-detalhado
                                                                              │
                                                                          QUERY │
                                                                              ▼
recebíveis-detalhado ──QUERY──▶ recebiveis-consolidado ──┐          despesas-consolidado
                                                          ▼                   │
extrato-detalhado ──SUMIFS+EOMONTH──────────────▶ saldo-consolidado ◀─────────┘
```

Camadas: **entidades** (listas de domínio que alimentam a validação de dados) → **detalhado** (lançamento linha a linha) → **resumido/consolidado** (agregação mensal) → **saldo** (saldo corrente acumulado).

Vale registrar que a planilha já precisou de código: há uma função customizada em Apps Script, `EXPRESSION_FROM_DATE("Fechamento do Mês ", A4)`, usada em 13 células de `despesas-detalhado`. É um indício de que o modelo em planilha chegou ao seu limite de expressividade.

## 2. Dinâmicas aproveitáveis

| Dinâmica na planilha | Vira | Tarefa |
|---|---|---|
| `SUMIFS(...) + <saldo do mês anterior>` | algoritmo de saldo previsto com carry-forward | FCB-012 |
| Janela `A2:B2` (fechamento→vencimento) no filtro do QUERY | "quais despesas caem nesta fatura" | FCB-010 |
| `WHERE Status <> 'Pago' AND Status <> ''` | definição operacional de "em aberto" | FCB-012 |
| `EDATE(A1,1)` propagando pares de datas | ciclo de fatura sem mês fixo (F002) | FCB-008 |
| Par de colunas `Atual`/`Total` | parcelamento, até 60x nos dados reais (F003) | FCB-009 |
| Linha marcadora `Fechamento do Mês` | evento de fechamento de fatura | FCB-015 |
| Separação `detalhado → consolidado → saldo` | módulos `expenses`/`earnings` → `reporting` | ADR-0003 |

Três merecem detalhe.

### 2.1 Saldo previsto com carry-forward

O núcleo de `saldo-consolidado`, uma célula por conta e por mês:

```
=SUMIFS('extrato-detalhado'!$E:$E,
        'extrato-detalhado'!$A:$A, ">="&C$1,
        'extrato-detalhado'!$A:$A, "<="&EOMONTH(C$1, 0),
        'extrato-detalhado'!$D:$D, $A3,
        'extrato-detalhado'!$G:$G, "Consolidado") + B3
```

O `+ B3` no final — o saldo da mesma conta no mês anterior — é o que transforma um somatório mensal em saldo corrente. `Saldo Final` fecha com `SUM` da coluna inteira, agregando contas + `A pagar` + `A Receber`. É o algoritmo do FCB-012 já validado em produção.

### 2.2 Janela de fatura como intervalo de datas

A agregação por fatura em `<cartão>-resumido`:

```
ARRAYFORMULA(QUERY({'nubank-detalhado'!$A:$G; {"Total Geral", ..., SUM(FILTER(...))}},
  "SELECT Col6, SUM(Col7)
   WHERE (Col1 >= DATE '"&TEXT(A2,"yyyy-MM-dd")&"' AND Col1 <= DATE '"&TEXT(B2,"yyyy-MM-dd")&"')
     AND Col6 IS NOT NULL AND Col6 <> '' OR Col6 = 'Total Geral'
   GROUP BY Col6 LABEL SUM(Col7) 'Total'", 1))
```

`A2:B2` é o par fechamento→vencimento daquela fatura. A regra de negócio "esta despesa pertence a esta fatura" é, portanto, **pertinência a um intervalo de datas** — e o agrupamento sai por tipo de despesa. Entra direto na spec do FCB-010.

### 2.3 A fronteira de `reporting` se sustenta na prática

O ADR-0003 estabelece na regra 5 que `reporting` é o único módulo autorizado a ler de múltiplos contextos, e só faz leitura. A planilha chegou espontaneamente ao mesmo desenho: as abas `*-consolidado` leem de outras abas e **não são lidas por ninguém** além da camada de saldo. A fronteira decidida no papel já existe de fato no protótipo.

## 3. Evidências para decisões de design

Cada falha abaixo foi confirmada nas fórmulas e sustenta uma decisão específica.

### 3.1 A ligação fatura↔despesa não pode ser posicional

As 29 ligações entre `despesas-detalhado` e as abas de cartão são referências de célula escritas à mão (`='santander-resumido'!R3`). **Oito apontam para o mês errado**, deslocadas em uma fatura:

| Linha | Mês | Cartão | Aponta para | Deveria | Efeito |
|---|---|---|---|---|---|
| 54 | 03/2026 | BV | `F3` (fev) | `H3` | +R$ 130,83 |
| 127 | 07/2026 | BV | `N3` (jun) | `P3` | +R$ 18,90 |
| 171 | 10/2026 | Santander | `R3` (set) | `T3` | −R$ 710,44 |
| 207 | 12/2026 | Santander | `V3` (nov) | `X3` | +R$ 900,00 |
| 72, 90, 108, 190 | abr–nov | BV / Santander | deslocada | — | valor coincide |

Efeito líquido: **R$ 339,29 de despesa a mais** do que as faturas somam. As quatro últimas são bomba-relógio: o valor bate por coincidência hoje, e qualquer edição na fatura passa a ir para o mês errado.

**Implicação (F004 / FCB-010):** com `CreditCardStatements` referenciando `Expenses` por chave estrangeira, esta classe inteira de erro deixa de ser representável. A associação despesa↔fatura precisa ser derivada da regra de pertinência (2.2), nunca declarada manualmente.

### 3.2 Total de fatura precisa ser derivado, nunca digitado

Três faturas não têm fórmula — o valor foi digitado. **Duas divergem** do que a agregação calcula:

| Mês | Cartão | Digitado | Agregação calcula | Δ |
|---|---|---|---|---|
| 01/2026 | Nubank | 8.366,96 | 8.361,49 | +5,47 |
| 03/2026 | Santander | 1.732,21 | 1.752,11 | −19,90 |
| 06/2026 | Nubank | 4.782,89 | 4.782,89 | confere |

**Implicação (ADR-0003, regra 4):** é a evidência prática da abordagem de ledger — lançamentos imutáveis com totais derivados por agregação. O total da fatura é um valor calculado e não deve ter caminho de escrita direto na API.

### 3.3 Status sem ponto de entrada vira status morto

A aba `saldo-previsto` soma dois status:

```
=SUMIFS(..., 'extrato-detalhado'!$G:$G, "Consolidado")
+SUMIFS(..., 'extrato-detalhado'!$G:$G, "Previsto")
```

Mas as 530 linhas de `extrato-detalhado` têm status **"Consolidado" em 100% dos casos**. O status "Previsto" existe na lista de domínio e nunca foi usado por ninguém: a segunda parcela sempre retorna zero, e a aba inteira é um no-op idêntico à primeira coluna de `saldo-consolidado`.

**Implicação (F003 / F005 / FCB-015):** os requisitos preveem o status "Previsto" para despesas e receitas. Se ele existir no enum sem uma ação de sistema que o produza, o resultado se repete. O produtor natural é a **recorrência mensal automática** do FCB-015: despesas e receitas fixas geradas para meses futuros nascem como "Previsto" e são promovidas a "Aberto" no vencimento. Sem esse mecanismo, o status não deve entrar no enum.

### 3.4 Regra de negócio replicada diverge em silêncio

Em `saldo-consolidado`, 11 contas somam o extrato. Dez filtram `Status = "Consolidado"`; a linha `Santander Poupança` filtra `Status <> "Vencido"`. Como nenhum registro tem status "Vencido", hoje o resultado é idêntico — as duas regras divergem apenas no dia em que um segundo status aparecer nos dados.

**Implicação (ADR-0003, regra 5):** o critério de composição de saldo é uma regra única, implementada uma vez em `reporting`, e não uma cópia por conta.

### 3.5 Cadastrar não é ligar

A aba `inter-resumido` tem 32 meses de calendário avançando corretamente via `EDATE` e **nenhuma QUERY**. O cartão Inter foi cadastrado, o esqueleto foi criado, e o motor de agregação nunca foi conectado — a aba soma zero há 32 meses sem sinalizar nada.

**Implicação (F002 / FCB-008):** o cadastro de um cartão deve instanciar seu ciclo de faturas como parte da mesma operação. Não pode existir cartão em estado "cadastrado mas não operante".

### 3.6 Alterar o vencimento não pode reescrever faturas fechadas

Nos dados reais, o vencimento do Santander é dia 5 até abril/2026 e passa a dia 3 a partir de maio/2026. O requisito F002 já prevê que fechamento e vencimento sejam alteráveis a qualquer momento — a planilha mostra que isso **acontece de fato**, e que ela preserva a data histórica de cada fatura em vez de recalcular o passado.

**Implicação (F002 / F004):** critério de aceite explícito — alterar o dia de fechamento ou vencimento afeta apenas faturas ainda não fechadas. A fatura fechada carrega suas próprias datas.

### 3.7 Falta decidir a representação monetária

A linha `Santander Poupança` carrega o valor `-2,7e-12` — resíduo de ponto flutuante exibido como zero. É inofensivo numa planilha e inaceitável num ledger, onde o saldo é derivado por agregação de milhares de lançamentos.

**Implicação:** não há, em nenhum documento ou ADR do projeto, decisão sobre representação de valores monetários. Numa plataforma financeira isso merece registro explícito (tipo de coluna no PostgreSQL, tipo na aplicação, política de arredondamento em rateios e conversões). Ver FC-005 no [backlog](backlog.md).

## 4. Insumos concretos para a Fase 2

**Seed e fixtures reais.** Os 19 tipos de despesa, 12 contas bancárias, 8 cartões e ~2.300 lançamentos permitem que as specs da Fase 2 nasçam com dados de produção em vez de valores sintéticos. As faturas com histórico completo (Santander e Nubank, 13+ ciclos cada) cobrem cenários de parcelamento longo, fatura zerada e alteração de vencimento.

**Casos de aceite derivados.** Os cenários da seção 3 entram como AC/INV nas specs correspondentes:

| Evidência | Vira critério em |
|---|---|
| 3.1 — associação despesa↔fatura derivada da janela de datas | FCB-010 |
| 3.2 — total de fatura sem caminho de escrita | FCB-009, FCB-010 |
| 3.3 — "Previsto" só existe com produtor automático | FCB-009, FCB-011, FCB-015 |
| 3.4 — critério de saldo único em `reporting` | FCB-012 |
| 3.5 — cartão cadastrado nasce operante | FCB-008 |
| 3.6 — alteração de vencimento não afeta fatura fechada | FCB-008, FCB-010 |

**Corpus de migração.** O FCB-013 (importação CSV) ganha um cliente real desde o primeiro dia, e o formato do CSV pode ser derivado das colunas já em uso:

```
Data | Cartão | Descrição | Parcela Atual | Parcela Total | Tipo despesa | Valor | Banco | Observação | Status
```

A migração da planilha para o sistema é, ela própria, o teste de aceitação do importador.

## 5. Referências

- [Requisitos de negócio](business-requirements.md) — F002, F003, F004, F005
- [ADR-0003](adr/ADR-0003-architecture-style.md) — monolito modular, regras 4 e 5
- [ADR-0005](adr/ADR-0005-queue.md) — eventos de domínio e trabalho assíncrono
- [Roadmap](roadmap.md) — Fase 2, fatias verticais
- [Backlog](backlog.md) — FCB-008 a FCB-015, FC-005
