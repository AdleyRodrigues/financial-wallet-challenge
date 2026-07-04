# Testes manuais — Auth e Wallet

Validação manual da API **antes** da etapa de transações financeiras.

**Pré-requisitos:**

- PostgreSQL via Docker em `localhost:5433` (recomendado) **ou** PostgreSQL local em `localhost:5432` — ver [setup-local-postgres.md](./setup-local-postgres.md)
- `api/.env` com `DATABASE_URL` compatível com a porta em uso
- `pnpm db:migrate` executado com sucesso
- API rodando: `pnpm dev:api` (porta `3333`)

**Ferramentas sugeridas:** curl, HTTPie, Insomnia ou Postman.

> **Windows (PowerShell):** para `curl`, prefira arquivo JSON (`--data-binary "@body.json"`) ou `Invoke-RestMethod` — aspas escapadas em `-d` costumam falhar.

---

## 1. Rotas privadas sem autenticação (deve falhar)

```bash
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3333/auth/me
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3333/wallet
```

**Esperado:** `401 Unauthorized`

---

## 2. Cadastro — Usuário 1 (Alice)

```bash
curl -s -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Silva\",\"email\":\"alice@example.com\",\"password\":\"Password123!\"}"
```

**Esperado:**

- Status `201` ou `200`
- JSON com `user.id`, `user.name`, `user.email`
- **Sem** campo `passwordHash`

---

## 3. Cadastro — Usuário 2 (Bruno)

```bash
curl -s -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bruno Costa\",\"email\":\"bruno@example.com\",\"password\":\"Password123!\"}"
```

---

## 4. Email duplicado (deve falhar)

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3333/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Duplicada\",\"email\":\"alice@example.com\",\"password\":\"Password123!\"}"
```

**Esperado:** `400 Bad Request` — email already in use

---

## 5. Login — Alice (salvar cookie)

```bash
curl -s -c cookies-alice.txt -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@example.com\",\"password\":\"Password123!\"}"
```

**Esperado:**

- Status `200`
- Header `Set-Cookie: accessToken=...; HttpOnly`
- `user` sem `passwordHash`

Verificar cookie:

```bash
# Windows PowerShell
Get-Content cookies-alice.txt
```

---

## 6. GET /auth/me — Alice

```bash
curl -s -b cookies-alice.txt http://localhost:3333/auth/me
```

**Esperado:**

```json
{
  "user": {
    "id": "...",
    "name": "Alice Silva",
    "email": "alice@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## 7. GET /wallet — Alice (saldo inicial)

```bash
curl -s -b cookies-alice.txt http://localhost:3333/wallet
```

**Esperado:**

```json
{
  "id": "...",
  "balance": "0.00"
}
```

---

## 8. Login — Bruno (cookie separado)

```bash
curl -s -c cookies-bruno.txt -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"bruno@example.com\",\"password\":\"Password123!\"}"
```

```bash
curl -s -b cookies-bruno.txt http://localhost:3333/wallet
```

**Esperado:** Bruno vê **apenas** a própria wallet (`balance: "0.00"`), ID diferente da de Alice.

---

## 9. Isolamento — Alice não acessa wallet de Bruno

Não há parâmetro de wallet ID na API. `GET /wallet` sempre retorna a wallet do JWT.

Com cookie de Alice, a resposta deve ser sempre a wallet de Alice — nunca a de Bruno.

---

## 10. Logout — Alice

```bash
curl -s -b cookies-alice.txt -c cookies-alice.txt -X POST http://localhost:3333/auth/logout
```

**Esperado:** `200` com `{ "message": "Logout successful" }`

Após logout, rotas privadas devem falhar:

```bash
curl -s -w "\nHTTP %{http_code}\n" -b cookies-alice.txt http://localhost:3333/auth/me
```

**Esperado:** `401` (cookie limpo ou token inválido)

---

## 11. Credenciais inválidas

```bash
curl -s -w "\nHTTP %{http_code}\n" -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"alice@example.com\",\"password\":\"wrongpassword\"}"
```

**Esperado:** `401 Unauthorized`

---

## Checklist de validação

| # | Cenário | OK? |
|---|---------|-----|
| 1 | Register cria User | ☐ |
| 2 | Register cria Wallet com balance 0 | ☐ |
| 3 | Email duplicado retorna 400 | ☐ |
| 4 | Login define cookie HttpOnly | ☐ |
| 5 | GET /auth/me retorna user sem passwordHash | ☐ |
| 6 | GET /wallet retorna balance 0.00 | ☐ |
| 7 | Cada usuário vê apenas sua wallet | ☐ |
| 8 | Rotas privadas retornam 401 sem cookie | ☐ |
| 9 | Logout limpa sessão | ☐ |
| 10 | passwordHash nunca aparece nas respostas | ☐ |

---

## Verificação no banco (opcional)

```sql
SELECT u.id, u.name, u.email, w.id AS wallet_id, w.balance
FROM "User" u
JOIN "Wallet" w ON w."userId" = u.id;
```

Confirme que Alice e Bruno têm wallets distintas com `balance = 0.00`.
