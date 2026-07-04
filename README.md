# financial-wallet-challenge

Aplicação full-stack de carteira financeira para desafio técnico — monólito modular, TypeScript, NestJS, PostgreSQL e Prisma.

**Etapa atual:** monorepo com pnpm, backend com autenticação e consulta de wallet. Transações financeiras, testes e frontend ainda não implementados.

## Tecnologias

| Camada | Stack |
|--------|-------|
| Backend | NestJS, Prisma, JWT + cookie HttpOnly |
| Frontend | Next.js App Router + Tailwind *(planejado)* |
| Banco | PostgreSQL (Docker) |
| Monorepo | pnpm workspaces (`api/` + `web/`) |

## Como rodar

**Pré-requisitos:** Node.js 20+, pnpm (Corepack), Docker Desktop (virtualização habilitada no BIOS).

```bash
corepack enable
pnpm install
docker compose up -d postgres
cp api/.env.example api/.env   # Windows: Copy-Item api/.env.example api/.env
pnpm db:generate
pnpm db:migrate
pnpm dev:api
```

> **Portas padrão:**
> - API: `http://localhost:3333`
> - Web (futura): `http://localhost:3000`
> - PostgreSQL (Docker): `localhost:5433`

`pnpm db:migrate` aplica migrations existentes sem prompt (`prisma migrate deploy`). Para criar novas migrations em desenvolvimento: `pnpm db:migrate:dev`.

Detalhes, troubleshooting e diagrama do fluxo: [local-setup-flow.md](docs/architecture/local-setup-flow.md).

**Docker indisponível?** Se aparecer *Virtualization support not detected*, use PostgreSQL local: [setup-local-postgres.md](docs/setup-local-postgres.md).

**Testar Auth + Wallet manualmente:** [manual-tests.md](docs/manual-tests.md).

## Variáveis de ambiente

Copie `api/.env.example` → `api/.env`. Referência completa em `.env.example` (raiz).

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | `postgresql://wallet_user:wallet_password@localhost:5433/wallet_db` (Docker) |
| `JWT_SECRET` | Segredo para assinatura JWT |
| `PORT` | Porta da API (padrão: `3333`) |
| `FRONTEND_URL` | Origem CORS do frontend (padrão: `http://localhost:3000`) |

## Funcionalidades (etapa atual)

| Método | Rota | Status |
|--------|------|--------|
| `POST` | `/auth/register` | Implementado |
| `POST` | `/auth/login` | Implementado |
| `POST` | `/auth/logout` | Implementado |
| `GET` | `/auth/me` | Implementado |
| `GET` | `/wallet` | Implementado |
| `POST` | `/transactions/*` | *Planejado* |
| Frontend `web/` | `/login`, `/register`, `/dashboard` | *Planejado* |

## Estrutura do repositório

```text
financial-wallet-challenge/
├── api/                  # NestJS + Prisma
├── web/                  # placeholder (Next.js futuro)
├── docs/architecture/    # documentação técnica detalhada
├── docker-compose.yml    # PostgreSQL
├── package.json
├── pnpm-workspace.yaml
└── pnpm-lock.yaml
```

## Documentação técnica

Documentação detalhada com diagramas Mermaid em `docs/architecture/`:

- [Índice da arquitetura](docs/architecture/README.md)
- [Visão geral do sistema](docs/architecture/system-overview.md)
- [Arquitetura do backend](docs/architecture/backend-architecture.md)
- [Modelagem de dados](docs/architecture/database-model.md)
- [Fluxo de autenticação](docs/architecture/auth-flow.md)
- [Operações financeiras](docs/architecture/financial-operations.md) — *planejado*
- [Fluxo de execução local](docs/architecture/local-setup-flow.md)

## Decisões em resumo

- **Monólito modular** — sem microservices, filas, Redis, CQRS ou event sourcing.
- **pnpm workspaces** — `node_modules` único na raiz, instalação mais rápida e menos duplicação. [Detalhes no índice de arquitetura](docs/architecture/README.md).
- **`api/` e `web/` na raiz** — estrutura simples para dois pacotes, sem `apps/`.
- **Prisma 7 + adapter `pg`** — conexão runtime via `@prisma/adapter-pg` e driver `pg` (requisito do Prisma 7).
- **Backend-first** — regras financeiras na API antes do frontend.
- **Reversão compensatória** *(planejada)* — restrita ao usuário originador; saldo negativo aceitável.

## Limitações conhecidas

- Docker Desktop exige virtualização habilitada no BIOS (VT-x/AMD-V). Sem isso, use [PostgreSQL local](docs/setup-local-postgres.md).
- `pnpm db:migrate` depende do PostgreSQL ativo e credenciais corretas em `api/.env`.
- `web/` é placeholder — frontend não implementado.
- Transações financeiras modeladas no schema, mas sem endpoints ainda.

## Próximas etapas

1. Implementar `TransactionsModule` (depósito, transferência, reversão, histórico).
2. Adicionar testes unitários do `TransactionsService`.
3. Inicializar Next.js em `web/` com UI/UX Pro Max.
