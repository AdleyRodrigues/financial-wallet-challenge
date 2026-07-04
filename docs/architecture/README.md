# Documentação de arquitetura

Índice da documentação técnica do projeto **financial-wallet-challenge**.

Esta pasta concentra diagramas Mermaid e explicações detalhadas. O [README principal](../../README.md) permanece como entrada rápida para rodar e entender o projeto.

## Índice

| Documento | Conteúdo |
|-----------|----------|
| [Visão geral do sistema](./system-overview.md) | Componentes do sistema, integrações e o que está implementado vs. planejado |
| [Arquitetura do backend](./backend-architecture.md) | Organização modular NestJS, camadas e decisões arquiteturais |
| [Modelagem de dados](./database-model.md) | Entidades Prisma, relacionamentos e uso de `Decimal` |
| [Fluxo de autenticação](./auth-flow.md) | Cadastro, login, logout, `/auth/me` e `GET /wallet` |
| [Operações financeiras](./financial-operations.md) | Depósito, transferência e reversão **planejados** (próxima etapa) |
| [Fluxo de execução local](./local-setup-flow.md) | Passo a passo para subir o ambiente de desenvolvimento |

## Estado atual do projeto

**Implementado:**

- Monorepo com pnpm (`api/` + `web/` placeholder)
- NestJS com `AuthModule`, `UsersModule`, `WalletsModule`, `PrismaModule`
- Endpoints de autenticação e `GET /wallet`
- Schema Prisma com `User`, `Wallet` e `Transaction`
- PostgreSQL via Docker Compose

**Planejado (próximas etapas):**

- `TransactionsModule` (depósito, transferência, reversão, histórico)
- Testes unitários e de integração
- Frontend Next.js em `web/`
