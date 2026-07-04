# Arquitetura da solução

Documentação técnica consolidada do **financial-wallet-challenge**.

**Ver também:** [README](../README.md) · [Testes manuais](manual-tests.md) · [Requisitos](requirements.md)

## Visão geral

Monólito modular full-stack: **Next.js** no frontend, **NestJS** na API, **PostgreSQL** via Docker, **Prisma** como ORM, autenticação **JWT em cookie HttpOnly** e **Material UI** para a interface.

A API concentra regras financeiras; o frontend consome contratos HTTP com `credentials: "include"`.

## Arquitetura geral

```mermaid
flowchart TB
  user[User]

  subgraph clientLayer [Client]
    webApp["Next.js Web App<br/>localhost:3000"]
  end

  subgraph apiLayer [NestJS API]
    authMod[AuthModule]
    walletsMod[WalletsModule]
    txMod[TransactionsModule]
  end

  subgraph dataLayer [Data]
    prisma[Prisma]
    postgres[(PostgreSQL)]
  end

  user --> webApp
  webApp -->|"HTTP + credentials"| authMod
  webApp --> walletsMod
  webApp --> txMod
  authMod --> prisma
  walletsMod --> prisma
  txMod --> prisma
  prisma --> postgres
```

## Modelagem de dados

```mermaid
erDiagram
  User ||--|| Wallet : owns
  Wallet ||--o{ Transaction : sends
  Wallet ||--o{ Transaction : receives
  Transaction ||--o| Transaction : "reversal of"

  User {
    uuid id PK
    string email UK
    string passwordHash
  }

  Wallet {
    uuid id PK
    uuid userId FK
    decimal balance
  }

  Transaction {
    uuid id PK
    string type
    string status
    decimal amount
    uuid fromWalletId FK
    uuid toWalletId FK
    uuid originalTransactionId FK
  }
```

- **User 1:1 Wallet** — uma carteira por usuário (`userId` único).
- **Transaction** liga carteiras de origem e destino (`fromWalletId` / `toWalletId` opcionais conforme o tipo).
- **Auto-relacionamento em `Transaction`** — a reversão (`type = REVERSAL`) aponta para a operação original via `originalTransactionId` (FK para outro registro da mesma tabela). Relação **1:0..1**: cada original tem no máximo uma reversão (`@unique`).

Tipos: `DEPOSIT`, `TRANSFER`, `REVERSAL`. Status da original: `COMPLETED` → `REVERSED`.

## Fluxo financeiro principal

```mermaid
sequenceDiagram
  participant User
  participant API as TransactionsService
  participant DB as PostgreSQL

  Note over User,DB: Depósito
  User->>API: POST /transactions/deposit
  API->>API: validate amount > 0
  API->>DB: BEGIN
  API->>DB: UPDATE Wallet increment balance
  API->>DB: INSERT Transaction DEPOSIT COMPLETED
  API->>DB: COMMIT

  Note over User,DB: Transferência
  User->>API: POST /transactions/transfer
  API->>API: validate receiver, amount, not self
  API->>DB: BEGIN
  API->>DB: updateMany sender where balance >= amount
  alt count !== 1
    API->>DB: ROLLBACK
    API-->>User: 400 Insufficient balance
  else debit ok
    API->>DB: UPDATE receiver increment
    API->>DB: INSERT Transaction TRANSFER COMPLETED
    API->>DB: COMMIT
  end

  Note over User,DB: Reversão compensatória
  User->>API: POST /transactions/:id/reverse
  API->>API: validate originator + status COMPLETED
  API->>DB: BEGIN
  API->>DB: updateMany original set REVERSED where COMPLETED
  alt already reversed
    API->>DB: ROLLBACK
    API-->>User: 400 already reversed
  else ok
    API->>DB: compensating wallet movements
    API->>DB: INSERT Transaction REVERSAL
    API->>DB: COMMIT
  end
```

**Regras resumidas:**

- **Depósito** — credita wallet autenticada; aceita saldo negativo prévio.
- **Transferência** — débito condicional atômico; crédito e registro na mesma transação de banco.
- **Reversão** — apenas originador (depositante ou remetente); saldo negativo após reversão é aceitável.

## Decisões principais

| Decisão | Motivo |
|---------|--------|
| Monólito modular | Simplicidade operacional; módulos NestJS com responsabilidades claras |
| `Decimal` para dinheiro | Evita erros de arredondamento de ponto flutuante |
| Transações Prisma (`$transaction`) | Atomicidade entre saldo e registro de `Transaction` |
| `updateMany` condicional | Protege transferência e reversão contra concorrência |
| Reversão compensatória | Preserva auditabilidade sem apagar histórico |
| Cookie HttpOnly | JWT inacessível ao JavaScript do browser |
| Material UI | Produtividade e consistência visual no frontend |

**Frontend:** componentes `.tsx` para renderização, hooks `use-*.ts` para estado/fluxo, `.styles.ts` para `SxProps` quando necessário, `services/` para HTTP.

**Fora de escopo:** microservices, filas, Redis, CQRS, event sourcing.
