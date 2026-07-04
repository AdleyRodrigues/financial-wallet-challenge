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

**Docker indisponível:** habilite virtualização no BIOS ou use PostgreSQL local na porta `5432` com `api/scripts/setup-local-db.sql` e ajuste `DATABASE_URL` em `api/.env`.

## Variáveis de ambiente

Copie `api/.env.example` → `api/.env` e `web/.env.example` → `web/.env.local`. Referência na raiz: `.env.example`.

| Variável | Pacote | Descrição |
|----------|--------|-----------|
| `DATABASE_URL` | api | Conexão PostgreSQL |
| `JWT_SECRET` | api | Segredo do JWT |
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

## Decisões técnicas principais

- **Monólito modular** — um deploy, módulos NestJS bem separados.
- **pnpm workspaces** — dependências centralizadas na raiz.
- **Prisma 7 + adapter `pg`** — driver PostgreSQL em runtime.
- **Decimal para dinheiro** — sem `float` em saldos e transações.
- **Transações Prisma** — depósito, transferência e reversão atômicos.
- **Update condicional** — `updateMany` com `balance >= amount` evita gasto duplicado em concorrência.
- **Reversão compensatória** — histórico preservado; apenas o originador reverte manualmente.
- **Cookie HttpOnly** — frontend usa `credentials: "include"`; JWT fora do `localStorage`.
- **Material UI** — interface consistente com tema customizado para contexto financeiro.

Detalhes e diagramas: [docs/architecture.md](docs/architecture.md).

## Testes

- **Unitários:** 15 testes do `TransactionsService` — `pnpm test`.
- **Manuais:** fluxo Alice/Bruno em [docs/manual-tests.md](docs/manual-tests.md).

## Documentação complementar

- [Arquitetura](docs/architecture.md)
- [Testes manuais](docs/manual-tests.md)
- [Requisitos considerados](docs/requirements.md)

## Melhorias futuras

- Testes de integração end-to-end
- Observabilidade (logs estruturados, métricas)
- Idempotency keys em operações financeiras
- Paginação no histórico de transações
- Middleware Next.js para proteção server-side de rotas
