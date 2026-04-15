# Pork — Backend

API REST do **Pork**, um app de controle financeiro pessoal. Gerencia despesas categorizadas, metas de economia e perfil financeiro do usuário (salário, plano de gasto, meta de economia).

Construída com **NestJS**, **PostgreSQL** e **Prisma**, com autenticação JWT via cookies HTTP-only.

> O frontend correspondente está em [Pork](../Pork/).

---

## Sumário

- [Estrutura do projeto](#estrutura-do-projeto)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Banco de dados](#banco-de-dados)
- [Rodando o projeto](#rodando-o-projeto)
  - [Sem Docker](#sem-docker)
  - [Com Docker](#com-docker)
- [Documentação da API (Swagger)](#documentação-da-api-swagger)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [User](#user)
  - [Expense (Despesas)](#expense-despesas)
  - [Goal (Metas)](#goal-metas)
  - [Health](#health)
- [Autenticação](#autenticação)
- [Segurança](#segurança)
- [Scripts disponíveis](#scripts-disponíveis)

---

## Estrutura do projeto

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── config/cookie.config.ts      # Configuração do cookie JWT
│   ├── dto/pagination.dto.ts        # Paginação por cursor
│   ├── filters/all-exceptions.filter.ts
│   ├── guards/auth/
│   │   ├── base-jwt.guard.ts        # Classe base com verificação JWT
│   │   ├── auth.guard.ts            # Guard obrigatório
│   │   ├── optionalAuth.guard.ts    # Guard opcional
│   │   └── ownership.guard.ts       # Verifica dono do recurso
│   ├── hash/hash.service.ts         # bcrypt
│   └── types/
│       ├── req-types.ts
│       └── query-types.ts
└── modules/
    ├── auth/                        # Login e logout
    ├── database/                    # PrismaService
    ├── expense/                     # Despesas
    ├── goal/                        # Metas financeiras
    ├── health/                      # Health check
    └── user/                        # Usuários

prisma/
├── schema.prisma
└── migrations/
```

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| NestJS | Framework principal |
| PostgreSQL | Banco de dados |
| Prisma | ORM e migrations |
| JWT + @nestjs/jwt | Autenticação via cookie HTTP-only |
| bcrypt | Hash de senhas |
| Helmet | Headers de segurança HTTP |
| @nestjs/throttler | Rate limiting (100 req/min) |
| nestjs-pino | Logging estruturado |
| @nestjs/swagger | Documentação automática |
| class-validator | Validação de DTOs |

---

## Pré-requisitos

- Node.js >= 20
- pnpm
- PostgreSQL rodando localmente ou em nuvem (ex: Neon, Supabase, Railway)

---

## Instalação

```bash
git clone <url-do-repositorio>
cd pork-backend
pnpm install
```

---

## Variáveis de ambiente

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3000

# URL de conexão PostgreSQL
DATABASE_URL="postgresql://usuario:senha@host:5432/nome_do_banco"
DIRECT_URL="postgresql://usuario:senha@host:5432/nome_do_banco"

# CORS — URL do frontend Pork
CORS_ORIGIN="http://localhost:5173"

# JWT — gere com: openssl rand -hex 64
JWT_SECRET="sua_chave_secreta"
JWT_EXPIRES_IN=86400

# bcrypt
SALT_ROUNDS=10

# Swagger (/api-docs — protegido por Basic Auth)
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin
```

---

## Banco de dados

```bash
# Aplicar migrations
pnpm prisma migrate deploy

# OU criar nova migration em desenvolvimento
pnpm prisma migrate dev

# Gerar Prisma Client
pnpm prisma generate

# UI do banco
pnpm prisma studio
```

### Modelos

```
User     → id, name, email, password, salary, plan, economy, createdAt, updatedAt
Expense  → id, title, category, amount, date, userId, createdAt, updatedAt
Goal     → id, name, targetAmount, currentAmount, deadline?, achieved, userId, createdAt, updatedAt
```

> O modelo `User` inclui campos financeiros: `salary` (salário), `plan` (plano de gastos) e `economy` (meta de economia mensal).

---

## Rodando o projeto

### Sem Docker

```bash
# Desenvolvimento (hot reload)
pnpm start:dev

# Produção
pnpm build
pnpm start:prod
```

O servidor sobe em `http://localhost:3000` (ou na `PORT` do `.env`).

### Com Docker

O projeto tem `Dockerfile` mas **não inclui banco de dados**. Forneça o PostgreSQL externamente.

```bash
# Build da imagem
docker build -t pork-backend .

# Rodar passando as variáveis
docker run -d \
  --name pork-api \
  -p 3000:3000 \
  --env-file .env \
  pork-backend
```

---

## Documentação da API (Swagger)

```
http://localhost:3000/api-docs
```

Protegido por Basic Auth — use as credenciais `SWAGGER_USER` e `SWAGGER_PASSWORD` do `.env`.

---

## Endpoints

### Auth

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/auth/login` | Não | Autentica e seta cookie `access_token` |
| `POST` | `/auth/logout` | Não | Limpa o cookie |

```json
{ "email": "user@email.com", "password": "minhasenha123" }
```

---

### User

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/user` | Não | Cria usuário |
| `GET` | `/user/me` | Opcional | Retorna usuário logado ou `null` |
| `GET` | `/user/:id` | Não | Busca usuário por ID |
| `PATCH` | `/user/:id` | Obrigatória + Ownership | Atualiza dados financeiros (somente o próprio) |
| `DELETE` | `/user/:id` | Obrigatória + Ownership | Remove conta (somente o próprio) |

```json
// Criar usuário
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "minhasenha123",
  "salary": 5000,
  "plan": "moderado",
  "economy": 1000
}
```

---

### Expense (Despesas)

Todas as rotas exigem autenticação. Dados isolados por usuário.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/expense` | Cria uma despesa |
| `GET` | `/expense` | Lista todas as despesas do usuário |
| `GET` | `/expense/:id` | Busca uma despesa por ID |
| `PATCH` | `/expense/:id` | Atualiza a despesa |
| `DELETE` | `/expense/:id` | Remove a despesa |

```json
// Criar despesa
{
  "title": "Mercado",
  "category": "Alimentação",
  "amount": 250.50,
  "date": "2026-04-15T00:00:00.000Z"
}
```

---

### Goal (Metas)

Todas as rotas exigem autenticação. Dados isolados por usuário.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/goal` | Cria uma meta |
| `GET` | `/goal` | Lista todas as metas do usuário |
| `GET` | `/goal/:id` | Busca uma meta por ID |
| `PATCH` | `/goal/:id` | Atualiza a meta (incluindo depósitos via `currentAmount`) |
| `DELETE` | `/goal/:id` | Remove a meta |

```json
// Criar meta
{
  "name": "Reserva de emergência",
  "targetAmount": 15000,
  "currentAmount": 3000,
  "deadline": "2026-12-31T00:00:00.000Z"
}
```

---

### Health

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/health` | Retorna `{ "status": "ok" }` |

---

## Autenticação

JWT armazenado em cookie HTTP-only (`access_token`).

1. `POST /auth/login` → API valida credenciais e seta o cookie
2. O navegador inclui o cookie automaticamente em cada requisição
3. Guards verificam o token (`AuthGuard`, `OwnershipGuard`)
4. `POST /auth/logout` → cookie removido

- Expiração padrão: **24h** (configurável via `JWT_EXPIRES_IN`)
- Payload do token: `{ sub: userId, name: userName }`

---

## Segurança

| Mecanismo | Descrição |
|---|---|
| Helmet | Headers HTTP de segurança |
| CORS | Origem restrita a `CORS_ORIGIN` |
| Rate Limiting | 100 req/min por IP (global) |
| HTTP-only Cookie | JWT inacessível via JavaScript |
| bcrypt | Senhas com hash |
| ValidationPipe | `whitelist: true`, `forbidNonWhitelisted: true` |
| OwnershipGuard | Garante que só o dono edita/deleta seus recursos |
| Swagger protegido | Basic Auth em `/api-docs` |

---

## Scripts disponíveis

```bash
pnpm start:dev        # Desenvolvimento com hot reload
pnpm build            # Build de produção
pnpm start:prod       # Inicia versão compilada
pnpm test             # Testes unitários
pnpm test:e2e         # Testes E2E
pnpm lint             # ESLint com auto-fix
pnpm format           # Prettier

# Prisma
pnpm prisma migrate dev --name nome_da_migration
pnpm prisma migrate deploy
pnpm prisma generate
pnpm prisma studio
```
