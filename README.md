# financial-wallet-challenge

Aplicação full-stack de carteira financeira — monólito modular com NestJS, Next.js, PostgreSQL e Prisma.

## Visão geral

API REST com autenticação JWT em cookie HttpOnly e frontend Next.js para cadastro, login, consulta de saldo, depósito, transferência, histórico e reversão compensatória.

## Stack utilizada

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, Prisma 7, JWT + cookie HttpOnly |
| Frontend | Next.js App Router, Material UI |
| Banco | PostgreSQL (Docker) |
| Monorepo | pnpm workspaces (`api/` + `web/`) |

## Funcionalidades

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro + wallet com saldo 0 |
| `POST` | `/auth/login` | Login (cookie HttpOnly) |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/auth/me` | Usuário autenticado |
| `GET` | `/wallet` | Saldo da wallet |
| `GET` | `/transactions` | Histórico |
| `POST` | `/transactions/deposit` | Depósito |
| `POST` | `/transactions/transfer` | Transferência |
| `POST` | `/transactions/:id/reverse` | Reversão compensatória |

Telas: `/login`, `/register`, `/dashboard`.

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

| Serviço | URL / porta |
|---------|-------------|
| Web | http://localhost:3000 |
| API | http://localhost:3333 |
| PostgreSQL (Docker) | localhost:5433 |

Apenas API: `pnpm dev:api`. Apenas frontend: `pnpm dev:web`.

## Autenticação e sessão

- Login emite **JWT** assinado com `JWT_SECRET` e expiração configurável (`JWT_EXPIRES_IN`, padrão `2h`).
- O token fica em cookie **`accessToken` HttpOnly** (`sameSite: lax`; `secure` em produção); a API **não** aceita `Authorization: Bearer`.
- As senhas são armazenadas com hash **bcrypt** e nunca são retornadas nas respostas da API.
- O `maxAge` do cookie acompanha a expiração do JWT.
- O frontend envia `credentials: "include"` e **não** persiste token em `localStorage`/`sessionStorage`.
- Respostas **401** em rotas protegidas redirecionam para `/login?reason=session-expired`.
- Logout manual limpa o cookie e redireciona para `/login` sem mensagem de sessão expirada.
- `GET /auth/me` retorna `sessionExpiresAt`; o dashboard exibe aviso nos **últimos 30 segundos** antes da expiração (token permanece no cookie HttpOnly).

**Docker indisponível:** habilite virtualização no BIOS ou use PostgreSQL local na porta `5432` com `api/scripts/setup-local-db.sql` e ajuste `DATABASE_URL` em `api/.env`.

## Variáveis de ambiente

Copie `api/.env.example` → `api/.env` e `web/.env.example` → `web/.env.local`. Referência na raiz: `.env.example`.

| Variável | Pacote | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | api | Conexão PostgreSQL |
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
| `pnpm db:migrate` | Aplica migrations (`migrate deploy`) |
| `pnpm db:migrate:dev` | Nova migration em desenvolvimento |
| `pnpm db:studio` | Prisma Studio |

# financial-wallet-challenge

Aplicação full-stack de carteira financeira — monólito modular com NestJS, Next.js, PostgreSQL e Prisma.

## Visão geral

API REST com autenticação JWT em cookie HttpOnly e frontend Next.js para cadastro, login, consulta de saldo, depósito, transferência, histórico e reversão compensatória.

## Stack utilizada

| Camada | Tecnologias |
|--------|-------------|
| Backend | NestJS, Prisma 7, JWT + cookie HttpOnly |
| Frontend | Next.js App Router, Material UI |
| Banco | PostgreSQL (Docker) |
| Monorepo | pnpm workspaces (`api/` + `web/`) |

## Funcionalidades

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/auth/register` | Cadastro + wallet com saldo 0 |
| `POST` | `/auth/login` | Login (cookie HttpOnly) |
| `POST` | `/auth/logout` | Logout |
| `GET` | `/auth/me` | Usuário autenticado |
| `GET` | `/wallet` | Saldo da wallet |
| `GET` | `/transactions` | Histórico |
| `POST` | `/transactions/deposit` | Depósito |
| `POST` | `/transactions/transfer` | Transferência |
| `POST` | `/transactions/:id/reverse` | Reversão compensatória |

Telas: `/login`, `/register`, `/dashboard`.

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

| Serviço | URL / porta |
|---------|-------------|
| Web | http://localhost:3000 |
| API | http://localhost:3333 |
| PostgreSQL (Docker) | localhost:5433 |

Apenas API: `pnpm dev:api`. Apenas frontend: `pnpm dev:web`.

## Autenticação e sessão

- Login emite **JWT** assinado com `JWT_SECRET` e expiração configurável (`JWT_EXPIRES_IN`, padrão `2h`).
- O token fica em cookie **`accessToken` HttpOnly** (`sameSite: lax`; `secure` em produção); a API **não** aceita `Authorization: Bearer`.
- As senhas são armazenadas com hash **bcrypt** e nunca são retornadas nas respostas da API.
- O `maxAge` do cookie acompanha a expiração do JWT.
- O frontend envia `credentials: "include"` e **não** persiste token em `localStorage`/`sessionStorage`.
- Respostas **401** em rotas protegidas redirecionam para `/login?reason=session-expired`.
- Logout manual limpa o cookie e redireciona para `/login` sem mensagem de sessão expirada.
- `GET /auth/me` retorna `sessionExpiresAt`; o dashboard exibe aviso nos **últimos 30 segundos** antes da expiração (token permanece no cookie HttpOnly).

**Docker indisponível:** habilite virtualização no BIOS ou use PostgreSQL local na porta `5432` com `api/scripts/setup-local-db.sql` e ajuste `DATABASE_URL` em `api/.env`.

## Variáveis de ambiente

Copie `api/.env.example` → `api/.env` e `web/.env.example` → `web/.env.local`. Referência na raiz: `.env.example`.

| Variável | Pacote | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | api | Conexão PostgreSQL |
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
| `pnpm db:migrate` | Aplica migrations (`migrate deploy`) |
| `pnpm db:migrate:dev` | Nova migration em desenvolvimento |
| `pnpm db:studio` | Prisma Studio |

## Decisões técnicas

As escolhas abaixo foram feitas considerando o escopo do desafio, a necessidade de entregar uma solução funcional, segura e fácil de revisar tecnicamente.

| Decisão | Justificativa |
|---------|---------------|
| Next.js | Optei por Next.js por ser uma das tecnologias desejadas no desafio e por oferecer uma base moderna para o frontend React, com App Router, boa organização de rotas e facilidade para estruturar telas como login, cadastro e dashboard. |
| NestJS | Escolhi NestJS por também estar entre as tecnologias desejadas e por facilitar uma arquitetura modular, com separação clara entre controllers, services, DTOs, guards e modules. Isso deixa o backend mais organizado e mais fácil de revisar em um code review. |
| TypeScript | Usei TypeScript em todo o projeto para ter contratos mais claros entre frontend e backend, reduzir erros em tempo de desenvolvimento e melhorar a manutenção do código. |
| PostgreSQL | Escolhi PostgreSQL por ser um banco relacional sólido para operações financeiras, com suporte a transações ACID, integridade referencial e tipos adequados para valores monetários, como `Decimal`/`Numeric`. |
| Prisma | Usei Prisma para padronizar o acesso ao banco, facilitar migrations, manter um schema explícito e ter boa integração com TypeScript. Apesar disso, as regras financeiras ficam nos services da aplicação, não delegadas ao ORM. |
| Material UI | Optei por Material UI porque tenho familiaridade com a biblioteca e ela acelera a construção de uma interface consistente, responsiva e com bom acabamento visual. Usei o tema customizado para evitar uma aparência genérica e aproximar a UI de um produto financeiro moderno. |
| JWT em cookie HttpOnly | Escolhi armazenar o JWT em cookie HttpOnly para evitar exposição do token via JavaScript e não depender de `localStorage` ou `sessionStorage`. O frontend usa `credentials: "include"` e a API trabalha em modo cookie-only, sem aceitar `Authorization: Bearer`. |
| bcrypt | Usei bcrypt para armazenar senhas com hash, garantindo que senha e `passwordHash` nunca sejam retornados nas respostas da API. |
| Docker para PostgreSQL | Usei Docker apenas para o PostgreSQL para padronizar o ambiente de banco durante a avaliação, sem obrigar o avaliador a configurar um banco local manualmente. API e frontend rodam localmente via pnpm para manter o setup simples. |
| pnpm workspaces | Escolhi pnpm workspaces para organizar `api/` e `web/` em um monorepo simples, com scripts centralizados na raiz, instalação eficiente das dependências e melhor aproveitamento de cache/armazenamento em comparação com abordagens mais tradicionais. |
| Monólito modular | Mantive a solução como monólito modular porque o escopo do desafio não exige microservices, filas ou arquitetura distribuída. A ideia foi reduzir complexidade operacional sem abrir mão de separação interna por módulos. |
| Reversão compensatória | Modelei a reversão como uma nova transação compensatória, em vez de apagar ou alterar diretamente o histórico. Essa abordagem preserva rastreabilidade e é mais adequada para um domínio financeiro. |
| Update condicional na transferência | Usei `updateMany` com `balance >= amount` dentro de uma transação Prisma para validar saldo no banco no momento do débito e reduzir risco de gasto duplicado em cenários concorrentes. |

Detalhes e diagramas: [docs/architecture.md](docs/architecture.md).

## Testes

- **Unitários:** 22 testes na API (`TransactionsService`, utilitários de cookie e estratégia JWT) — `pnpm test`. Sem testes de integração/e2e nesta entrega.
- **Manuais:** fluxo Alice/Bruno em [docs/manual-tests.md](docs/manual-tests.md).

## Documentação complementar

- [Arquitetura](docs/architecture.md)
- [Testes manuais](docs/manual-tests.md)
- [Requisitos considerados](docs/requirements.md)

## Melhorias futuras

- Testes de integração end-to-end (API + banco + frontend)
- Observabilidade (logs estruturados, métricas)
- Idempotency keys em operações financeiras
- Rate limiting em rotas sensíveis (auth e transações)
- Paginação no histórico de transações
- Middleware Next.js para proteção server-side de rotas


Detalhes e diagramas: [docs/architecture.md](docs/architecture.md).

## Testes

- **Unitários:** 22 testes na API (`TransactionsService`, utilitários de cookie e estratégia JWT) — `pnpm test`. Sem testes de integração/e2e nesta entrega.
- **Manuais:** fluxo Alice/Bruno em [docs/manual-tests.md](docs/manual-tests.md).

## Documentação complementar

- [Arquitetura](docs/architecture.md)
- [Testes manuais](docs/manual-tests.md)
- [Requisitos considerados](docs/requirements.md)

## Melhorias futuras

- Testes de integração end-to-end (API + banco + frontend)
- Observabilidade (logs estruturados, métricas)
- Idempotency keys em operações financeiras
- Rate limiting em rotas sensíveis (auth e transações)
- Paginação no histórico de transações
- Middleware Next.js para proteção server-side de rotas
