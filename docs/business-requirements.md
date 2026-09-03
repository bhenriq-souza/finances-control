# Requisitos de Negócio — Finances Control

## 1. Descrição do projeto

- O projeto tem como objetivo criar uma plataforma de controle financeiro pessoal, onde os usuários poderão gerenciar suas finanças, acompanhar seus gastos e receitas, criar orçamentos, além de gerar relatórios para análise de suas finanças.
- A plataforma será acessível via web e terá uma interface amigável e intuitiva para facilitar o uso dos usuários.

## 2. Requisitos funcionais

### F001 — Cadastro de Usuários

- Os usuários poderão criar uma conta na plataforma, fornecendo informações básicas como nome, email e senha.
- O sistema deve garantir a segurança dos dados dos usuários, utilizando práticas de criptografia para proteger as informações sensíveis.
- Usuários poderão fazer sign-up e login utilizando contas de redes sociais, inicialmente com o Google.
- O usuário administrador deverá conceder os privilégios de acesso aos usuários.

### F002 — Cadastro de Bancos, Contas Bancárias e Cartões de Crédito

- Os usuários poderão cadastrar seus bancos, contas bancárias e cartões de crédito para acompanhar suas finanças de forma mais completa.
- O sistema deve permitir a importação de CSV padronizado para criação de bancos, contas bancárias e cartões de crédito.
- Contas bancárias e cartões de crédito deverão estar associados a um banco específico.
- Contas bancárias devem ter um saldo, sendo que cada despesa associada a uma conta bancária, mas que não esteja associada a um cartão de crédito, deverá refletir no saldo da conta bancária.
- Cartões de crédito devem ter um limite, sendo que cada despesa associada a um cartão de crédito deverá refletir no limite disponível do cartão.
- Cartões de crédito deverão ter um dia de fechamento e um dia de vencimento, sem referência a um mês específico, e poderão ser alterados a qualquer momento.
- O sistema deverá calcular o saldo previsto de uma conta bancária, dado um período de tempo específico, levando em consideração as despesas com status Previsto e Aberto associadas a essa conta bancária, e as receitas associadas a essa conta bancária.
- Contas bancárias podem ser:
  - Conta Corrente
  - Conta Poupança
  - Conta Investimento

### F003 — Controle Financeiro: Despesas

- Usuários poderão registrar suas despesas, categorizá-las e acompanhar seus gastos ao longo do tempo.
- O sistema deve permitir a importação de CSV padronizado para criação de despesas.
- Usuários devem ser capazes de incluir tipos de despesas novos, além das categorias pré-definidas, para melhor organização de suas finanças.
- Despesas devem ser associadas a uma conta bancária ou cartão de crédito específico, para que o sistema possa calcular o saldo disponível corretamente.
- Despesas associadas a um cartão de crédito deverão refletir no limite disponível do cartão.
- Despesas podem ser:
  - **Fixas**: ocorrem mensalmente;
  - **Variáveis**: ocorrem de forma esporádica;
  - **Parceladas**: ocorrem em parcelas mensais. Se uma despesa for parcelada, com cartão de crédito associado, o sistema deve criar automaticamente as parcelas futuras, associando-as ao mesmo cartão de crédito e refletindo no limite disponível do cartão.
- Despesas devem ter status, inicialmente: **Aberto**, **Previsto**, **Pago**, **Vencido** e **Verificando**.
  - Despesas com status Aberto deverão refletir no saldo disponível da conta bancária ou limite disponível do cartão de crédito.
  - Despesas com status Pago deverão refletir no saldo disponível da conta bancária ou limite disponível do cartão de crédito, e não deverão mais refletir a partir do momento em que forem marcadas como pagas.
  - Despesas com status Previsto não deverão refletir no saldo disponível da conta bancária ou limite disponível do cartão de crédito, mas deverão ser utilizadas para calcular o saldo previsto de uma conta bancária, dado um período de tempo específico.

> Nota: o texto original continha uma ambiguidade — afirmava que despesas "Aberto ou Previsto" refletem no saldo e, adiante, que "Previsto" não reflete. A leitura consolidada acima (Aberto reflete; Previsto só entra no saldo previsto) deve ser confirmada na spec formal de despesas.

### F004 — Faturas de Cartão de Crédito

- Faturas de cartão de crédito deverão englobar as despesas, que por sua vez deverão refletir no limite disponível do cartão de crédito.
- Faturas pagas deverão refletir no limite disponível do cartão de crédito (liberação do limite).
- O usuário deverá ter a capacidade de visualizar o resumo de suas faturas.

### F005 — Controle Financeiro: Receitas

- Usuários poderão registrar suas receitas e categorizá-las.
- O sistema deve permitir a importação de CSV padronizado para criação de receitas.
- Usuários devem ser capazes de incluir tipos de receitas novos, além das categorias pré-definidas, para melhor organização de suas finanças.
- Receitas devem ser associadas a uma conta bancária específica, para que o sistema possa calcular o saldo disponível corretamente.
- Receitas podem ser:
  - **Fixas**: ocorrem mensalmente;
  - **Variáveis**: ocorrem de forma esporádica.
- Receitas devem ter status, inicialmente: **Aberto**, **Previsto**, **Recebido**, **Vencido** e **Verificando**.
  - Receitas com status Aberto deverão refletir no saldo disponível da conta bancária.
  - Receitas com status Recebido deverão refletir no saldo disponível da conta bancária, e não deverão mais refletir a partir do momento em que forem marcadas como recebidas.
  - Receitas com status Previsto não deverão refletir no saldo disponível da conta bancária, mas deverão ser utilizadas para calcular o saldo previsto de uma conta bancária, dado um período de tempo específico.

> Mesma ambiguidade de F003 sobre "Aberto ou Previsto" — consolidar na spec formal de receitas.

## 3. Modelo de dados inicial

Diagrama em [assets/billing-control-database-schema.jpg](assets/billing-control-database-schema.jpg). Entidades: `User`, `UserProfile`, `Expenses`, `ExpenseType`, `EntryStatus`, `CreditCard`, `CreditCardStatements`, `Bank`, `BankAccount`, `BankAccountTypes`, `Earning`, `EarningType`.

## 4. Requisitos não funcionais

### Responsividade

- A interface deve ser **responsiva**: experiência agradável — não apenas funcional — no browser do computador, do celular e do tablet.
- Layouts, navegação e tabelas de lançamentos precisam se adaptar a cada tamanho de tela. A identidade visual (FC-006) define os breakpoints de referência; o frontend adota abordagem mobile-first ([ADR-0001](adr/ADR-0001-frontend.md)).
