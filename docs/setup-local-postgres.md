# PostgreSQL local (sem Docker)

Use este guia quando o **Docker Desktop não estiver disponível** — por exemplo, erro *"Virtualization support not detected"*.

## Situação comum no Windows

O Docker Desktop exige virtualização de hardware (Intel VT-x / AMD-V) habilitada no BIOS/UEFI. Sem isso, `docker compose up -d postgres` não funciona.

**Alternativa:** usar o PostgreSQL instalado nativamente no Windows. Neste ambiente foi detectado:

- Serviço: `postgresql-x64-18` (**Running**)
- Binário: `C:\Program Files\PostgreSQL\18\bin\psql.exe`

## Opção A — Habilitar virtualização (para usar Docker)

1. Reinicie e entre no BIOS/UEFI (Del, F2, F10 — varia por fabricante).
2. Ative **Intel Virtualization Technology (VT-x)** ou **AMD-V / SVM Mode**.
3. No Windows, confirme em *Gerenciador de Tarefas → Desempenho → CPU* que *Virtualização* está **Habilitada**.
4. Reinicie o Docker Desktop e rode:

```bash
docker compose up -d postgres
```

O container expõe PostgreSQL em **`localhost:5433`** (porta externa) para não conflitar com PostgreSQL local na `5432`.

## Opção B — PostgreSQL local (fallback na porta 5432)

### 1. Criar banco e usuário

Abra **pgAdmin** (instalado com PostgreSQL) ou **SQL Shell (psql)** e conecte como superusuário `postgres` (senha definida na instalação).

Execute o script:

```text
api/scripts/setup-local-db.sql
```

Ou manualmente:

```sql
CREATE USER wallet_user WITH PASSWORD 'wallet_password';
CREATE DATABASE wallet_db OWNER wallet_user;
GRANT ALL PRIVILEGES ON DATABASE wallet_db TO wallet_user;
```

Conecte em `wallet_db` e execute:

```sql
GRANT ALL ON SCHEMA public TO wallet_user;
```

### 2. Configurar `.env`

O arquivo `api/.env` já deve conter:

```env
DATABASE_URL="postgresql://wallet_user:wallet_password@localhost:5432/wallet_db?schema=public"
JWT_SECRET=change-me
PORT=3333
FRONTEND_URL=http://localhost:3000
```

Ajuste usuário/senha se usar credenciais diferentes.

### 3. Migrations e API

```bash
pnpm db:generate
pnpm db:migrate
pnpm dev:api
```

### 4. Validar manualmente

Siga [manual-tests.md](./manual-tests.md).

## Via linha de comando (PowerShell)

Substitua `SUA_SENHA_POSTGRES` pela senha do usuário `postgres`:

```powershell
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$env:PGPASSWORD = "SUA_SENHA_POSTGRES"
& $psql -U postgres -h localhost -f api/scripts/setup-local-db.sql
```

Depois:

```bash
pnpm db:generate
pnpm db:migrate
pnpm dev:api
```

## Troubleshooting

| Erro | Causa provável | Solução |
|------|----------------|---------|
| Virtualization support not detected | VT-x/AMD-V desabilitado | Opção A ou use Opção B |
| password authentication failed | Senha incorreta | Verifique senha do `postgres` ou credenciais em `api/.env` |
| database "wallet_db" does not exist | Banco não criado | Rode `setup-local-db.sql` |
| P1000 Prisma authentication failed | `DATABASE_URL` incorreto | Confira user/password/porta em `api/.env` |
| Port 5432 already in use | PostgreSQL local + Docker | Use apenas um; pare o outro |

## Docker vs local — qual usar?

| | Docker Compose | PostgreSQL local |
|--|----------------|------------------|
| Requisito | Virtualização + Docker Desktop ativo | Instalação nativa |
| Porta host | **5433** | **5432** |
| Credenciais | `wallet_user` / `wallet_password` | Mesmas após script |
| `DATABASE_URL` | `...@localhost:5433/...` | `...@localhost:5432/...` |

O projeto funciona com ambos; escolha o que estiver disponível na sua máquina.
