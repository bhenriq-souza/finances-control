# Perfis de Usuário

Desde a Fase 5 (decisões de 2026-10-15), todo registro financeiro pertence a um **espaço**, o equivalente a uma conta no app. Há dois níveis de permissão: o **admin da plataforma**, que vale para o sistema todo, e o **perfil no espaço**, que vale só dentro do espaço de que o usuário é membro. Na Fase 5, cada usuário é membro de no máximo um espaço.

## Admin da plataforma

Não é um perfil: é uma marca no usuário, independente de ele ser membro de um espaço.

- Aprovar usuários, dizendo em qual espaço entram: um espaço novo, do qual o usuário vira **ADMIN**, ou um espaço existente, com um perfil.
- Trocar o perfil de um membro e removê-lo do espaço (ele volta a pendente; os registros ficam no espaço).
- Criar e renomear espaços.
- Cadastrar, alterar e arquivar os catálogos globais: **bancos** e **tipos de despesa e de receita**.

O primeiro admin da plataforma nasce do bootstrap por email do backend. Nenhuma tela concede ou tira a marca.

## Perfil no espaço

| Perfil | Permissões, só dentro do próprio espaço |
|---|---|
| **ADMIN** | Tudo o que o BILLER faz; cadastrar, alterar e arquivar contas bancárias e cartões |
| **BILLER** | Lançar e alterar despesas, receitas e séries fixas; pagar e desfazer pagamentos de fatura; registrar estornos; conferir a fatura; agendar e concluir transferências |
| **VIEWER** | Consultar tudo do espaço: contas, cartões, despesas, receitas, faturas, transferências e relatórios |
| _sem perfil_ | Nada além de ver a própria conta, até que um admin da plataforma o aprove num espaço |

- Ninguém vê nem altera registro de outro espaço: para o app, ele não existe.
- Bancos e tipos de despesa e de receita são lidos por todos os espaços, mas só o admin da plataforma os escreve. O **BILLER deixou de criar e alterar tipos**, e o **ADMIN do espaço deixou de cadastrar bancos**: um tipo ou banco criado num espaço apareceria para todos.
- Gerir usuários deixou de ser do ADMIN: é do admin da plataforma.

A matriz segue o que o backend implementa: specs `0010` a `0021` do
[`finances-control-backend`](https://github.com/bhenriq-souza/finances-control-backend/tree/develop/specs). A spec `0021` define os espaços e o isolamento.

> O modelo de dados guarda o perfil no membro do espaço (`workspace_members`), e não mais no usuário. A concessão de privilégios é feita pelo admin da plataforma (ver F001 em [requisitos de negócio](business-requirements.md)).
