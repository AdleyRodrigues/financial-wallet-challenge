# Testes manuais

Guia prático para validar a solução ponta a ponta.

**Ver também:** [README](../README.md) · [Arquitetura](architecture.md) · [Requisitos](requirements.md)

## Pré-requisitos

- Docker rodando com PostgreSQL (`docker compose up -d postgres`)
- `pnpm db:generate` e `pnpm db:migrate` executados
- API em http://localhost:3333
- Web em http://localhost:3000 (`pnpm dev`)

Credenciais sugeridas ao cadastrar: senha `Password123!` para ambos os usuários do roteiro abaixo.

## Fluxo Alice/Bruno

Não há login padrão nem seed no banco. **Alice** e **Bruno** são personagens fictícios do roteiro — crie as duas contas em `/register` antes de começar (passos 1 e 2), ou use contas que você já tenha cadastrado com os mesmos e-mails.

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

## Testes automatizados (opcional)

Com Docker e migrations aplicadas:

```bash
pnpm test:e2e:api
pnpm --filter web test:e2e:install   # primeira vez
pnpm test:e2e:web
```

Ou tudo junto: `pnpm test:e2e`.

## Checklist rápido

| Cenário | OK? |
|---------|-----|
| Cadastro cria User + Wallet (saldo 0) | ☐ |
| Login define cookie HttpOnly | ☐ |
| Rotas privadas retornam 401 sem sessão | ☐ |
| Cookie-only: Bearer no header não autentica | ☐ |
| Logout limpa cookie e redireciona para `/login` | ☐ |
| Depósito aumenta saldo | ☐ |
| Transferência debita/credita corretamente | ☐ |
| Destinatário não reverte transferência recebida | ☐ |
| Remetente reverte transferência enviada | ☐ |
| Reversão duplicada bloqueada | ☐ |
| Aviso de sessão nos últimos 30s (opcional) | ☐ |

**Expiração de sessão (temporário):** use `JWT_EXPIRES_IN=1m` em `api/.env`, reinicie a API, faça login e aguarde o aviso nos últimos 30 segundos. Restaure `2h` (ou remova a linha) antes de commitar — não versione esse valor de teste.
