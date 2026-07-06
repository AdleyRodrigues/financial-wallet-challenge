# financial-wallet-challenge

Carteira financeira full-stack com cadastro, autenticação, depósito, transferência, histórico e reversão compensatória.

Este projeto foi desenvolvido como solução para um desafio técnico full-stack, com foco em segurança, consistência financeira, arquitetura modular e experiência de usuário. A implementação prioriza um fluxo simples de avaliação, mas com decisões relevantes para um domínio financeiro — uso de `Decimal`, transações de banco, validação de saldo no débito e reversão sem apagar histórico.

## Destaques técnicos

- Autenticação com JWT em cookie HttpOnly, sem uso de `localStorage`/`sessionStorage`.
- Sessão com expiração configurável e aviso preventivo nos últimos 30 segundos.
- Senhas armazenadas com bcrypt.
- Valores monetários com `Decimal`/`Numeric`, evitando problemas de precisão.
- Transferência com validação de saldo dentro de transação no banco.
- Reversão compensatória, preservando histórico financeiro.
- API NestJS modular, com separação entre controllers, services, DTOs, guards e Prisma.
- Frontend Next.js com Material UI, tema customizado e UX orientada para fluxo financeiro.

## O que a aplicação faz

- Cria usuários com wallet própria.
- Autentica com JWT em cookie HttpOnly.
- Permite depósito de saldo.
- Permite transferência entre usuários.
- Valida saldo antes da transferência.
- Mantém histórico financeiro.
- Permite reversão compensatória sem apagar histórico.
- Exibe aviso antes da sessão expirar.

## Stack utilizada

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, Prisma 7, JWT + cookie HttpOnly |
| Frontend | Next.js App Router, Material UI |
| Banco | PostgreSQL (Docker) |
| Monorepo | pnpm workspaces (`api/` + `web/`) |

## Como rodar

**Pré-requisitos:** Node.js 20+, pnpm (Corepack), Docker Desktop.

```bash
corepack enable
pnpm install
docker compose up -d postgres
cp api/.env.example api/.env          # Windows: Copy-Item api/.env.example api/.env
cp web/.env.example web/.env.local    # Windows: Copy-Item web/.env.example web/.env.local
pnpm db:generate
pnpm db:migrate
pnpm dev
```

Atalho: `pnpm setup` (`pnpm install && pnpm db:generate`).

Apenas API: `pnpm dev:api`. Apenas frontend: `pnpm dev:web`.

**Docker indisponível:** use PostgreSQL local na porta `5432` com `api/scripts/setup-local-db.sql` e ajuste `DATABASE_URL` em `api/.env`.

## URLs principais

| Serviço | URL / porta |
|---------|-------------|
| Web | http://localhost:3000 |
| API | http://localhost:3333 |
| PostgreSQL (Docker) | localhost:5433 |

Telas: `/login`, `/register`, `/dashboard`.

## Funcionalidades e rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro + wallet com saldo 0 |
| `POST` | `/auth/login` | Login (cookie HttpOnly) |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/auth/me` | Usuário autenticado + `sessionExpiresAt` |
| `GET` | `/wallet` | Saldo da wallet |
| `GET` | `/transactions` | Histórico |
| `POST` | `/transactions/deposit` | Depósito |
| `POST` | `/transactions/transfer` | Transferência |
| `POST` | `/transactions/:id/reverse` | Reversão compensatória |

## Autenticação e sessão

- Login emite **JWT** assinado com `JWT_SECRET` e expiração configurável (`JWT_EXPIRES_IN`, padrão `2h`).
- O token fica em cookie **`accessToken` HttpOnly** (`sameSite: lax`; `secure` em produção); a API **não** aceita `Authorization: Bearer`.
- As senhas são armazenadas com hash **bcrypt** e nunca são retornadas nas respostas da API.
- O `maxAge` do cookie acompanha a expiração do JWT.
- O frontend envia `credentials: "include"` e **não** persiste token em `localStorage`/`sessionStorage`.
- Respostas **401** em rotas protegidas redirecionam para `/login?reason=session-expired`.
- Logout manual limpa o cookie e redireciona para `/login` sem mensagem de sessão expirada.
- `GET /auth/me` retorna `sessionExpiresAt`; o dashboard exibe aviso nos **últimos 30 segundos** antes da expiração.

## Variáveis de ambiente

Copie `api/.env.example` → `api/.env` e `web/.env.example` → `web/.env.local`. Referência na raiz: `.env.example`.

| Variável | Pacote | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | api | Conexão PostgreSQL |
| `DATABASE_URL_TEST` | api | Banco usado pelos testes e2e/integration (fallback para `DATABASE_URL`) |
| `JWT_SECRET` | api | Segredo do JWT |
| `JWT_EXPIRES_IN` | api | Expiração do JWT e do cookie (padrão: `2h`) |
| `PORT` | api | Porta da API (padrão: `3333`) |
| `FRONTEND_URL` | api | Origem CORS (padrão: `http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | web | URL da API (padrão: `http://localhost:3333`) |

## Scripts úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | API + frontend |
| `pnpm build` | Build de `api/` e `web/` |
| `pnpm lint` | ESLint nos dois pacotes |
| `pnpm test` | Testes unitários da API |
| `pnpm test:e2e:api` | Testes de integração da API (Nest real + Supertest + cookies) |
| `pnpm test:e2e:web` | Fluxo crítico web com Playwright |
| `pnpm test:e2e` | Executa API e2e + Web e2e |
| `pnpm db:migrate` | Aplica migrations (`migrate deploy`) |
| `pnpm db:migrate:dev` | Nova migration em desenvolvimento |
| `pnpm db:studio` | Prisma Studio |

## Decisões técnicas

As escolhas abaixo consideram o escopo do desafio, a revisão técnica e a adequação ao domínio financeiro.

| Decisão | Justificativa |
|---------|---------------|
| Next.js | Optei por Next.js por ser uma das tecnologias desejadas no desafio e por oferecer base moderna para React, com App Router e organização clara de rotas e telas. |
| NestJS | Escolhi NestJS por facilitar arquitetura modular, com separação entre controllers, services, DTOs, guards e modules — estrutura adequada para code review. |
| TypeScript | Usei TypeScript em todo o projeto para contratos mais claros entre frontend e backend, menor risco de erro e melhor manutenção. |
| PostgreSQL | Escolhi PostgreSQL por ser relacional, com transações ACID, integridade referencial e tipos adequados para valores monetários (`Decimal`/`Numeric`). |
| Prisma | Usei Prisma para padronizar acesso ao banco, migrations versionadas, schema explícito e integração com TypeScript. As regras financeiras ficam nos **services**, não no ORM. |
| Material UI | Optei por Material UI pela familiaridade, produtividade e consistência visual; componentes prontos para forms, alerts e dialogs, com responsividade e tema customizado para aparência de produto financeiro. |
| JWT em cookie HttpOnly | Escolhi cookie HttpOnly para evitar token em `localStorage`/`sessionStorage`, reduzir exposição ao JavaScript e combinar com `credentials: "include"`. API cookie-only, sem `Authorization: Bearer`. |
| bcrypt | Usei bcrypt para hash de senhas; credenciais e `passwordHash` nunca retornados pela API. |
| Docker (PostgreSQL) | Usei Docker apenas para o banco, padronizando o ambiente de avaliação sem exigir instalação manual de PostgreSQL. |
| pnpm workspaces | Escolhi pnpm workspaces para monorepo simples (`api/` + `web/`), scripts centralizados na raiz e instalação de dependências mais rápida e eficiente. |
| Monólito modular | Mantive monólito modular porque microservices, filas e arquitetura distribuída seriam complexidade desnecessária para o escopo, sem perder separação interna por módulos. |
| Reversão compensatória | Modelei reversão como nova transação compensatória, preservando histórico e auditabilidade em vez de apagar ou sobrescrever registros. |
| Update condicional | Usei `updateMany` com `balance >= amount` dentro de transação Prisma para validar saldo no banco e proteger contra gasto duplicado em cenários concorrentes. |

Detalhes e diagramas: [docs/architecture.md](docs/architecture.md).

## Testes

- **Unitários:** 22 testes na API (`TransactionsService`, utilitários de cookie e estratégia JWT) — `pnpm test`.
- **Integração/e2e:** fluxo financeiro com API real (Supertest + cookies) e fluxo crítico no browser (Playwright) — `pnpm test:e2e`.
- **Manuais:** fluxo Alice/Bruno em [docs/manual-tests.md](docs/manual-tests.md).

### Testes e2e/integrados

Com o PostgreSQL rodando:

```bash
docker compose up -d postgres
pnpm db:migrate
pnpm test:e2e
```

Na primeira execução do Playwright, instale o Chromium:

```bash
pnpm --filter web test:e2e:install
```

A suíte e2e valida o fluxo principal da API e o fluxo crítico no browser: cadastro, login, depósito, transferência, histórico e reversão compensatória.

## Documentação complementar

- [Arquitetura](docs/architecture.md)
- [Testes manuais](docs/manual-tests.md)
- [Requisitos considerados](docs/requirements.md)

## Melhorias futuras

- Observabilidade (logs estruturados, métricas)
- Idempotency keys em operações financeiras
- Rate limiting em rotas sensíveis (auth e transações)
- Paginação no histórico de transações
- Middleware Next.js para proteção server-side de rotas
