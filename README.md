# Sonic Store API

REST API de e-commerce para gerenciamento de produtos, pedidos, usuários e carrinho de compras.

## Tecnologias

- **Node.js** + **Express 5**
- **PostgreSQL** + **Prisma ORM**
- **JWT** para autenticação
- **Zod** para validação de dados
- **Bcrypt** para hash de senhas
- **Helmet** + **CORS** + **express-rate-limit** para segurança
- **Swagger UI** para documentação interativa
- **Vitest** para testes unitários

## Pré-requisitos

- Node.js 18+
- PostgreSQL

## Instalação

```bash
npm install
```

Crie um arquivo `.env` na raiz com as variáveis:

```env
DATABASE_URL="postgresql://user:password@host:5432/sonic_store"
JWT_SECRET="seu_secret_aqui"
JWT_EXPIRES_IN="7d"
PORT=3000
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia em modo desenvolvimento com nodemon |
| `npm start` | Inicia em produção |
| `npm run start:dev` | Executa migrate + generate + nodemon |
| `npm test` | Executa testes unitários |
| `npm run test:watch` | Testes em modo watch |

## Banco de dados

```bash
# Criar e aplicar migrations
npx prisma migrate dev --name init

# Gerar cliente Prisma
npx prisma generate

# Seed (opcional)
npm run prisma seed
```

> IDs usam UUID (string) gerado automaticamente pelo banco.

## Rotas

| Prefixo | Recurso |
|---------|---------|
| `/auth` | Registro, login, perfil |
| `/users` | Gerenciamento de usuários (admin) |
| `/categories` | Categorias de produtos |
| `/products` | Produtos |
| `/products/:id/images` | Imagens do produto |
| `/cart` | Carrinho do usuário |
| `/orders` | Pedidos |
| `/addresses` | Endereços do usuário |

Documentação interativa disponível em `/api-docs` com o servidor rodando.

## Testes

Apenas testes unitários. Cobrem utilitários (`createError`, `generateSlug`, `generateToken`), validators (`authValidators`, `globalValidators`) e lógica de negócio sem dependência de banco de dados.

```bash
npm test
```

## Estrutura

```
src/
├── controllers/   # Handlers HTTP
├── services/      # Lógica de negócio
├── middlewares/   # Auth, erros
├── validators/    # Schemas Zod
├── utils/         # Funções auxiliares
├── routes/        # Definição de rotas
├── lib/           # Prisma client
└── tests/unit/    # Testes unitários
prisma/
└── schema.prisma  # Schema do banco
```
