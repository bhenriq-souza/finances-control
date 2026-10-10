# Perfis de Usuário

| Perfil | Permissões |
|---|---|
| **ADMIN** | Tudo o que o BILLER faz; gerenciar usuários e perfis; cadastrar, alterar e arquivar bancos, contas bancárias e cartões |
| **BILLER** | Lançar e alterar despesas, receitas, seus tipos e séries fixas; pagar e desfazer pagamentos de fatura; registrar estornos; agendar e concluir transferências |
| **VIEWER** | Consultar tudo: contas, cartões, despesas, receitas, faturas, transferências e relatórios |
| _sem perfil_ | Nada além de ver a própria conta, até que um ADMIN conceda um perfil |

A matriz segue o que o backend implementa: specs `0010` a `0018` do
[`finances-control-backend`](https://github.com/bhenriq-souza/finances-control-backend/tree/develop/specs).
A versão anterior falava em "assinaturas" e "pagamentos" como áreas próprias, que o produto não tem.

> O modelo de dados referencia estes perfis na entidade `UserProfile` (admin, biller, viewer). A concessão de privilégios é feita pelo usuário administrador (ver F001 em [requisitos de negócio](business-requirements.md)).
