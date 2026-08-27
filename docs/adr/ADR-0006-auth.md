# ADR-0006 — Autenticação: Firebase Auth

- Status: **draft** (proposta, aguardando aprovação)

## Context

F001 exige cadastro com email/senha **e** login social com Google, com segurança de credenciais. O `control-backend` (2025) já implementou verificação de token via **Firebase Auth** (`firebase-admin`, middleware `verifyToken`), código que pode ser portado. Não existe pacote `@bhs-dev` de auth, nem previsão no roadmap do monorepo de commons.

## Proposta

- Delegar identidade ao **Firebase Authentication**: email/senha + provider Google prontos, sem custódia de senhas na plataforma.
- Backend valida o ID token via `firebase-admin` (portando o padrão do `control-backend`) e mantém a tabela própria `User`/`UserProfile` para RBAC (Admin/Biller/Viewer), vinculada pelo UID do Firebase.
- Concessão de privilégios (F001) permanece no domínio da aplicação, não no Firebase.

## Consequences

- Menos superfície de segurança própria (sem hash de senha, sem fluxo de reset).
- Dependência de serviço externo do Google (aceitável: login Google já é requisito).
- RBAC continua testável e local.

## Alternatives considered

- **Auth própria (JWT + bcrypt)**: mais controle, muito mais superfície de risco e trabalho.
- **Keycloak/Ory no cluster**: peso operacional excessivo para single-node e um único tenant.
