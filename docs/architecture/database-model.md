# Modelagem de dados

Modelo relacional definido em `api/prisma/schema.prisma`.

A tabela `Transaction` já está modelada no schema para suportar depósito, transferência e reversão na **próxima etapa**, mas ainda não possui endpoints ou service implementados.

## Diagrama entidade-relacionamento

```mermaid
erDiagram
  User ||--o| Wallet : owns
  Wallet ||--o{ Transaction : "fromWallet outgoing"
  Wallet ||--o{ Transaction : "toWallet incoming"
  Transaction ||--o{ Transaction : "originalTransaction reversals"

  User {
    uuid id PK
    string name
    string email UK
    string passwordHash
    datetime createdAt
    datetime updatedAt
  }

  Wallet {
    uuid id PK
    uuid userId UK FK
    decimal balance
    datetime createdAt
    datetime updatedAt
  }

  Transaction {
    uuid id PK
    enum type
    enum status
    decimal amount
    uuid fromWalletId FK
    uuid toWalletId FK
    uuid originalTransactionId FK
    string description
    datetime createdAt
    datetime reversedAt
  }
```

## Enums

| Enum | Valores | Uso |
|------|---------|-----|
| `TransactionType` | `DEPOSIT`, `TRANSFER`, `REVERSAL` | Tipo da operação financeira |
| `TransactionStatus` | `COMPLETED`, `REVERSED` | Estado da transação original |

## Por que User e Wallet são separados?

- **Separação de responsabilidades** — credenciais e identidade (`User`) ficam isoladas de saldo e movimentações (`Wallet`).
- **Integridade** — relação 1:1 garante uma carteira por usuário via `userId` único.
- **Extensibilidade** — futuras regras financeiras operam sobre `Wallet` sem expor dados sensíveis de autenticação.

## Por que `balance` é `Decimal(18, 2)`?

Valores monetários **não devem usar `float`**. Tipos de ponto flutuante binário introduzem erros de arredondamento (ex.: `0.1 + 0.2 ≠ 0.3`). O PostgreSQL `NUMERIC`/`DECIMAL` e o tipo `Decimal` do Prisma preservam precisão decimal fixa, adequada para saldos e transações.

## Por que `fromWalletId` e `toWalletId` são opcionais?

Cada tipo de operação envolve carteiras diferentes:

| Tipo | `fromWalletId` | `toWalletId` |
|------|----------------|--------------|
| `DEPOSIT` | `null` | wallet do depositante |
| `TRANSFER` | wallet do remetente | wallet do destinatário |
| `REVERSAL` (depósito) | wallet do depositante | `null` |
| `REVERSAL` (transferência) | wallet do destinatário | wallet do remetente |

Campos opcionais permitem um único modelo `Transaction` para todos os tipos.

## Por que `originalTransactionId` existe?

Suporta o padrão de **reversão compensatória**:

- A transação original permanece no histórico.
- Uma nova `Transaction` com `type = REVERSAL` referencia a original via `originalTransactionId`.
- A original é marcada como `status = REVERSED`.

Isso preserva auditabilidade sem apagar ou sobrescrever registros.

## Índices

O schema define índices em `fromWalletId`, `toWalletId`, `originalTransactionId` e `createdAt` para consultas eficientes de histórico e reversão.

## Estado de implementação

| Entidade | Schema Prisma | Endpoints / Service |
|----------|---------------|---------------------|
| `User` | Sim | Sim (`AuthModule`, `UsersModule`) |
| `Wallet` | Sim | Sim (`WalletsModule`) |
| `Transaction` | Sim | Não — próxima etapa |
