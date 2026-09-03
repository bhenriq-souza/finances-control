# ADR-0007 — Representação monetária

- Status: **accepted**
- Data: 2026-09-03

## Context

Numa plataforma financeira o saldo é derivado por agregação de milhares de lançamentos; qualquer erro de representação se acumula. A planilha legada já exibe o sintoma: a linha `Santander Poupança` carrega `-2,7e-12`, resíduo de ponto flutuante mostrado como zero ([análise](../legacy-spreadsheet-analysis.md#37-falta-decidir-a-representação-monetária)).

A spec 0000 do backend traz a invariante **INV-0000-04** — valores monetários nunca em ponto flutuante, persistidos como `numeric` e manipulados como "inteiro de centavos ou string decimal" — mas deixa a escolha entre as duas formas em aberto, e nenhum documento decide rateio, arredondamento, moeda ou parsing de entrada. O [ADR-0001](ADR-0001-frontend.md) já descreve o cliente trabalhando com inteiro de centavos. A migration inicial (FCB-006) precisa dos tipos de coluna definidos.

Os dados de entrada (CSV, planilha) usam o formato brasileiro `1.234,56`.

## Decision

1. **Persistência**: toda coluna monetária é `numeric(14,2)` — até R$ 999.999.999.999,99. Proibidos `real`, `double precision` e o tipo `money` do PostgreSQL (dependente de locale).
2. **Aplicação e API**: **inteiro de centavos**, como `number` inteiro em TypeScript, com sufixo `Cents` no nome do campo (`amountCents`). No contrato OpenAPI, `type: integer`. A API nunca transporta decimal em string nem valor formatado.
   - O TypeORM devolve `numeric` como string: um `ValueTransformer` converte para centavos na fronteira da entidade; o domínio nunca vê string nem `number` fracionário.
   - Agregações (`SUM`, saldo) rodam no banco em `numeric` — exatas — e o resultado é convertido para centavos na leitura.
3. **Rateio de parcelas** (e qualquer divisão de valor): divisão inteira em centavos; o resto (0 a n−1 centavos) é absorvido pela **primeira parcela**. Invariante: a soma das parcelas é igual ao total, sempre — verificada por teste na spec de despesas. Ex.: R$ 100,00 em 3 = 33,34 + 33,33 + 33,33.
4. **Arredondamento** quando uma operação não é exata (percentuais, conversões): **half-up simétrico** — afasta do zero no 0,5 exato, também para negativos. Toda aritmética monetária passa por um único helper `Money` em `platform`; `Math.round` direto sobre valor monetário não é permitido, porque arredonda −1,5 para −1.
5. **Moeda**: BRL implícito, sem coluna de moeda. Multi-moeda seria um ADR que supera este.
6. **Entrada**: importação de CSV/planilha usa parser dedicado do formato brasileiro (`1.234,56` → `123456`). `parseFloat`/`Number()` sobre valor monetário são proibidos, verificável por regra de lint a critério da spec de quality gates.
7. **Exibição**: só na apresentação, no frontend, com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.

## Consequences

- A INV-0000-04 passa a ter uma forma só: inteiro de centavos. A spec 0000 do backend deve ser ajustada para citar este ADR (tarefa no backlog do backend).
- Limites coerentes: `number` inteiro é exato até 2^53 − 1 centavos (≈ R$ 90 trilhões), muito acima do teto da coluna.
- Zero dependência de biblioteca decimal enquanto a escala é fixa em 2 casas.
- Rateio e arredondamento ganham testes de domínio obrigatórios (INV-0000-04 é verificada por "testes de domínio das specs 0011+ e revisão em PR").
- O frontend recebe centavos e só formata; formulários convertem a digitação (`1.234,56`) para centavos antes de enviar.
- O `ValueTransformer` do TypeORM é código de `platform`, reutilizado por todas as entidades com valor monetário.

## Alternatives considered

- **`bigint` em centavos no banco**: igualmente exato, mas `SUM` e leitura humana no SQL ficam em centavos; `numeric(14,2)` é legível e é o que a invariante já dizia.
- **String decimal (`"123.45"`) na API e na aplicação**: exige biblioteca (`decimal.js`/`big.js`) para toda aritmética e cria atrito com zod e formulários, sem ganho enquanto a escala é fixa.
- **Biblioteca de money (`dinero.js`)**: abstração a mais para moeda única e escala fixa; revisitar se multi-moeda entrar.
- **`float`/`double`/`money` do PostgreSQL**: rejeitados — o resíduo da planilha é exatamente o defeito a evitar, e `money` depende de locale.
- **Resto do rateio na última parcela ou distribuído**: escolha arbitrária; fixado na primeira por ser a convenção usual em faturas de cartão e por ser determinístico.
- **Half-even (ABNT NBR 5891)**: reduz viés estatístico em séries longas, sem exigência regulatória num app pessoal; half-up é o que o usuário espera ao conferir à mão.
