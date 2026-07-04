# Testes manuais

Guia prático para validar a solução ponta a ponta.

**Ver também:** [README](../README.md) · [Arquitetura](architecture.md) · [Requisitos](requirements.md)

## Pré-requisitos

- Docker rodando com PostgreSQL (`docker compose up -d postgres`)
- `pnpm db:generate` e `pnpm db:migrate` executados
- API em http://localhost:3333
- Web em http://localhost:3000 (`pnpm dev`)

Credenciais de teste sugeridas: senha `Password123!` para ambos os usuários.

## Fluxo Alice/Bruno

### Via interface (recomendado)

1. Cadastrar **Alice** em `/register` (`alice@example.com`).
2. Cadastrar **Bruno** em `/register` (`bruno@example.com`).
3. Login como Alice → dashboard.
4. Depositar **100** → saldo `100,00`.
5. Transferir **40** para `bruno@example.com`.
6. Validar histórico de Alice (depósito + transferência enviada com opção de reverter).
7. Logout → login como Bruno → saldo **40,00**.
8. Confirmar que Bruno **não** pode reverter a transferência recebida.
9. Logout → login como Alice.
10. Reverter a transferência enviada (confirmar no dialog).
11. Validar saldos: Alice **100,00**, Bruno **0,00**.
12. Tentar reverter novamente → deve falhar ou não exibir ação.

### Via API (opcional)

Com cookies salvos (`curl -c` / `-b`):

1. `POST /auth/register` — Alice e Bruno.
2. `POST /auth/login` — Alice.
3. `POST /transactions/deposit` — `{"amount":100}`.
4. `POST /transactions/transfer` — `{"receiverEmail":"bruno@example.com","amount":40}`.
5. `GET /transactions` — histórico de Alice.
6. Login Bruno → `GET /wallet` → `40.00`.
7. Bruno: `POST /transactions/{id}/reverse` → **400**.
8. Alice: `POST /transactions/{id}/reverse` → **201**.
9. `GET /wallet` — Alice `100.00`, Bruno `0.00`.
10. Repetir reversão → **400**.

## Checklist rápido

| Cenário | OK? |
|---------|-----|
| Cadastro cria User + Wallet (saldo 0) | ☐ |
| Login define cookie HttpOnly | ☐ |
| Rotas privadas retornam 401 sem sessão | ☐ |
| Depósito aumenta saldo | ☐ |
| Transferência debita/credita corretamente | ☐ |
| Destinatário não reverte transferência recebida | ☐ |
| Remetente reverte transferência enviada | ☐ |
| Reversão duplicada bloqueada | ☐ |
