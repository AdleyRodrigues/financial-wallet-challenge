# Requisitos considerados

Mapeamento objetivo entre o escopo do desafio e a implementação entregue.

**Ver também:** [README](../README.md) · [Arquitetura](architecture.md) · [Testes manuais](manual-tests.md)

## Requisitos funcionais considerados

- Cadastro de usuário com criação automática de wallet
- Autenticação e sessão protegida
- Consulta de saldo da própria wallet
- Depósito com valor positivo
- Transferência entre usuários com validação de saldo
- Histórico de transações da wallet autenticada
- Reversão compensatória pelo originador da operação

## Critérios técnicos considerados

- Backend em NestJS com módulos separados
- Persistência PostgreSQL com Prisma e migrations
- Operações financeiras atômicas
- Proteção contra concorrência em débitos
- Testes unitários das regras de negócio e autenticação
- Testes de integração/e2e para API e fluxo web crítico
- Frontend integrado à API real
- Documentação objetiva para execução e revisão

## Tabela de aderência

| Requisito | Implementação | Status |
|-----------|---------------|--------|
| Cadastro | `POST /auth/register` + tela `/register` | Implementado |
| Autenticação | JWT HttpOnly + tela `/login` | Implementado |
| Depósito | `POST /transactions/deposit` | Implementado |
| Transferência | `POST /transactions/transfer` | Implementado |
| Recebimento | Wallet do destinatário + histórico | Implementado |
| Validação de saldo | `updateMany` condicional com `balance >= amount` | Implementado |
| Reversão | `POST /transactions/:id/reverse` | Implementado |
| Docker | PostgreSQL via `docker-compose` | Implementado |
| Testes unitários | `TransactionsService`, auth cookie e JWT strategy specs | Implementado |
| Testes integração/e2e | Supertest (API real) + Playwright (fluxo crítico web) | Implementado |
| Server Actions | Não utilizado; API NestJS separada do frontend | Não aplicável |
| Sessão | `JWT_EXPIRES_IN`, cookie HttpOnly, `sessionExpiresAt`, aviso 30s | Implementado |
| Documentação | README + `docs/` | Implementado |

## Melhorias futuras

- Observabilidade (logs estruturados, tracing, métricas)
- Idempotency keys em depósito, transferência e reversão
- Rate limiting em rotas sensíveis
- Paginação no histórico de transações
