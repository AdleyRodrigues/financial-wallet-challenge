# Fluxo de autenticação

Fluxos **implementados** na etapa atual: cadastro, login, logout, `/auth/me` e `GET /wallet`.

Autenticação via **JWT em cookie HttpOnly** — o token não é exposto ao JavaScript do browser (diferente de `localStorage`).

## Cadastro (`POST /auth/register`)

```mermaid
sequenceDiagram
  participant User
  participant AuthController
  participant ValidationPipe
  participant AuthService
  participant UsersService
  participant Prisma as PrismaService
  participant DB as PostgreSQL

  User->>AuthController: POST /auth/register name email password
  AuthController->>ValidationPipe: validate RegisterDto
  ValidationPipe-->>AuthController: OK
  AuthController->>AuthService: register(dto)
  AuthService->>UsersService: findByEmail(email)
  UsersService->>Prisma: user.findUnique
  Prisma->>DB: SELECT
  DB-->>Prisma: null or existing
  alt email already in use
    AuthService-->>User: 400 Bad Request
  else email available
    AuthService->>AuthService: bcrypt.hash password
    AuthService->>UsersService: createWithWallet
    UsersService->>Prisma: transaction User + Wallet
    Prisma->>DB: INSERT User INSERT Wallet balance 0
    DB-->>Prisma: created
    AuthService-->>User: 201 user without passwordHash
  end
```

**Regras:**

- Email único.
- Senha com hash bcrypt (cost factor 10).
- Wallet criada automaticamente com `balance = 0`.
- Resposta nunca inclui `passwordHash`.

## Login (`POST /auth/login`)

```mermaid
sequenceDiagram
  participant User
  participant AuthController
  participant AuthService
  participant UsersService
  participant Prisma as PrismaService
  participant DB as PostgreSQL

  User->>AuthController: POST /auth/login email password
  AuthController->>AuthService: login(dto response)
  AuthService->>UsersService: findByEmail(email)
  UsersService->>Prisma: user.findUnique
  Prisma->>DB: SELECT
  DB-->>Prisma: User
  AuthService->>AuthService: bcrypt.compare password passwordHash
  alt invalid credentials
    AuthService-->>User: 401 Unauthorized
  else valid credentials
    AuthService->>AuthService: jwt.sign sub email
    AuthService->>User: Set-Cookie accessToken HttpOnly
    AuthService-->>User: 200 user without passwordHash
  end
```

**Cookie:**

- Nome: `accessToken`
- Flags: `httpOnly`, `sameSite: lax`, `secure` em produção
- Expiração: 1 dia

## Rotas protegidas (`GET /auth/me`, `GET /wallet`)

```mermaid
sequenceDiagram
  participant User
  participant Controller
  participant JwtAuthGuard
  participant JwtStrategy
  participant Service
  participant Prisma as PrismaService
  participant DB as PostgreSQL

  User->>Controller: GET /auth/me or GET /wallet Cookie accessToken
  Controller->>JwtAuthGuard: canActivate
  JwtAuthGuard->>JwtStrategy: validate JWT from cookie
  JwtStrategy-->>JwtAuthGuard: user id email
  JwtAuthGuard-->>Controller: authenticated
  Controller->>Service: me userId or getWalletByUserId userId
  Service->>Prisma: find user or wallet by userId
  Prisma->>DB: SELECT
  DB-->>Prisma: result
  Service-->>User: 200 safe response
```

**Isolamento:**

- `GET /wallet` usa apenas o `userId` extraído do JWT.
- Não há parâmetro de wallet ID vindo do client — impossível consultar wallet de outro usuário.

## Logout (`POST /auth/logout`)

```mermaid
sequenceDiagram
  participant User
  participant AuthController
  participant JwtAuthGuard
  participant AuthService

  User->>AuthController: POST /auth/logout Cookie accessToken
  AuthController->>JwtAuthGuard: canActivate
  JwtAuthGuard-->>AuthController: authenticated
  AuthController->>AuthService: logout(response)
  AuthService->>User: Clear-Cookie accessToken
  AuthService-->>User: 200 logout successful
```

**Stateless:** não há blacklist de token no servidor. O cookie é removido; o JWT expira naturalmente se ainda existir em cache do client.

## Resumo de segurança

| Aspecto | Implementação |
|---------|---------------|
| Armazenamento de senha | bcrypt hash |
| Sessão | JWT em cookie HttpOnly |
| Proteção de rotas | `JwtAuthGuard` |
| Exposição de dados | `passwordHash` nunca retornado |
| CORS | `credentials: true` para cookies cross-origin controlados |
