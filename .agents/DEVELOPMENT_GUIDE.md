# REST API Template — Guia de Desenvolvimento

> Guia baseado no código real do projeto. Tudo aqui reflete a estrutura e padrões que você já está usando.

---

## 📋 Índice

1. [Estrutura de Pastas Real](#estrutura-de-pastas-real)
2. [Arquitetura: Controller → Service](#arquitetura-controller--service)
3. [Padrão de Código](#padrão-de-código)
4. [Prisma Client](#prisma-client)
5. [Autenticação JWT](#autenticação-jwt)
6. [Validação com Zod](#validação-com-zod)
7. [Utils — Funções Reutilizáveis](#utils--funções-reutilizáveis)
8. [Segurança](#segurança)
9. [Tratamento de Erros](#tratamento-de-erros)
10. [Variáveis de Ambiente](#variáveis-de-ambiente)
11. [Rotas da API](#rotas-da-api)
12. [Próximos módulos a implementar](#próximos-módulos-a-implementar)
13. [Bugs conhecidos e pontos de atenção](#bugs-conhecidos-e-pontos-de-atenção)

---

## Estrutura de Pastas Real

```
api-template/
├── server.js                          # Ponto de entrada — só sobe o servidor
├── prisma.config.js                   # Configuração do Prisma CLI
├── package.json
├── .env                               # Variáveis de ambiente (nunca subir no git)
├── .env.example                       # Modelo do .env para outros devs
├── .gitignore
│
├── prisma/
│   ├── schema.prisma                  # Modelos do banco de dados
│   └── migrations/                    # Histórico de alterações no banco
│
└── src/
    ├── app.js                         # Configura o Express e registra as rotas
    ├── generated/prisma/              # Gerado pelo Prisma — não editar (está no .gitignore)
    │
    ├── lib/
    │   └── prisma.js                  # Instância única do Prisma Client
    │
    ├── controllers/                   # Recebe req, valida com Zod, chama o Service
    │   ├── authControllers.js
    │   ├── categoriesControllers.js
    │   ├── productsControllers.js
    │   └── userControllers.js
    │
    ├── services/                      # Regra de negócio e comunicação com o banco
    │   ├── authServices.js
    │   ├── categoriesServices.js
    │   ├── productsServices.js
    │   └── userServices.js
    │
    ├── routes/                        # Define os endpoints e os middlewares de cada rota
    │   ├── authRoutes.js
    │   ├── categoriesRoutes.js
    │   ├── productsRoutes.js
    │   └── userRoutes.js
    │
    ├── middlewares/
    │   └── authMiddlewares.js         # authToken e authAdminOnly
    │
    ├── validators/                    # Schemas Zod para validar os dados da requisição
    │   ├── globalValidators.js        # idParamsSchema — reutilizado em tudo
    │   ├── authValidators.js
    │   ├── categoriesValidators.js
    │   ├── productsValidators.js
    │   └── userValidators.js
    │
    └── utils/                         # Funções auxiliares reutilizáveis
        ├── compareHashPassword.js
        ├── generateHashPassword.js
        ├── generateSlug.js
        ├── generateToken.js
        └── getRequeridEnv.js          # Lê variável de ambiente e lança erro se faltar
```

> **Por que essa separação?**
> Controllers não sabem como o banco funciona. Services não sabem como a requisição chegou.
> Cada camada tem uma responsabilidade — facilita encontrar bugs e fazer mudanças.

---

## Arquitetura: Controller → Service

O fluxo de uma requisição segue sempre esse caminho:

```
Requisição HTTP
      ↓
  Route (define o endpoint e os middlewares)
      ↓
  Middleware (authToken? authAdminOnly?)
      ↓
  Controller (valida com Zod, chama o Service, responde)
      ↓
  Service (lógica de negócio, acessa o banco via Prisma)
      ↓
  Prisma (banco PostgreSQL)
```

### Exemplo real: criar produto

```
POST /products
  → productsRoutes.js  (define a rota)
  → authToken          (verifica JWT)
  → authAdminOnly      (verifica se é ADMIN)
  → productsControllers.createProduct  (valida body com productSchema)
  → productsServices.create            (gera slug, salva no banco)
  → prisma.product.create
  → resposta 201
```

---

## Padrão de Código

### Classes com singleton

Todos os controllers e services são **classes exportadas como instância única**:

```js
class ProductsService {
  async create(data) { ... }
  async getAll() { ... }
}

export default new ProductsService(); // instância única, já pronta pra usar
```

Quando você importa, já tem a instância:

```js
import productsServices from "../services/productsServices.js";
// productsServices.create(), productsServices.getAll() — direto!
```

### .bind() nas rotas

Sempre use `.bind()` ao passar métodos de classe como callback de rota:

```js
// ✅ Correto
routes.post("/", productsControllers.createProduct.bind(productsControllers));

// ❌ Sem .bind() o `this` dentro do método fica undefined e quebra
routes.post("/", productsControllers.createProduct);
```

### Estrutura de um Controller

```js
async createProduct(req, res, next) {
  try {
    // 1. Valida com Zod
    const validation = productSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    // 2. Chama o Service com os dados já validados
    const product = await productsServices.create(validation.data);

    // 3. Responde
    res.status(201).json({ message: "Produto criado com sucesso.", product });
  } catch (error) {
    next(error); // erros sobem pro middleware de erro global
  }
}
```

### Estrutura de um Service

O Service não valida dados — recebe dados já validados, aplica regras de negócio e usa o Prisma:

```js
async create(data) {
  const { categoryId, name, mark, description, price, stock, imageUrl } = data;

  return await prisma.product.create({
    data: {
      categoryId, name, mark, description, price, stock, imageUrl,
      slug: generateSlug(name), // regra de negócio: slug gerado automaticamente
    },
    select: productSelect, // nunca retornar mais campos do que o necessário
  });
}
```

---

## Prisma Client

O arquivo `src/lib/prisma.js` usa o **adapter PrismaPg** para conectar com PostgreSQL:

```js
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export default prisma;
```

> **Atenção:** O import vem de `../generated/prisma/client.js`, não de `@prisma/client` direto.
> Isso é porque o `schema.prisma` define `output = "../src/generated/prisma"`.

### Sempre use `select`

Nunca retorne todos os campos. Defina explicitamente o que vai sair:

```js
// ✅ Correto — só retorna o necessário, password nunca sai
const user = await prisma.user.findUnique({
  where: { email },
  select: {
    id: true,
    name: true,
    email: true,
    role: true,
    isActive: true,
  },
});

// ❌ Errado — expõe a senha e outros campos internos
const user = await prisma.user.findUnique({ where: { email } });
```

### Código P2002 — violação de unique

Quando tentar criar algo que já existe (email, slug, etc.), o Prisma lança um erro com código `P2002`. Trate no Service:

```js
} catch (error) {
  if (error.code === "P2002") {
    throw new Error("Email já cadastrado.");
  }
  throw error; // outros erros sobem normalmente
}
```

---

## Autenticação JWT

### Como funciona no projeto

```
Login
  → gera token com { id, role, isActive }
  → cliente guarda o token

Próximas requisições protegidas
  → envia no header: Authorization: Bearer <token>
  → authToken verifica e decodifica
  → req.user = { id, role, isActive }
  → controller acessa req.user.id, req.user.role
```

### generateToken.js

```js
export const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, isActive: user.isActive },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
```

### authToken middleware

```js
export const authToken = (req, res, next) => {
  try {
    const headerAuthorization = req.headers.authorization;

    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = headerAuthorization.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Bloqueia usuários desativados mesmo com token válido
    if (!decoded.isActive) {
      return res.status(401).json({ message: "Usuário desativado, acesso negado." });
    }

    req.user = decoded; // { id, role, isActive }
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
```

### authAdminOnly middleware

Sempre vem **depois** do `authToken`, pois depende do `req.user`:

```js
export const authAdminOnly = (req, res, next) => {
  if (!req.user?.role || req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Acesso admin negado." });
  }
  next();
};
```

### Como aplicar nas rotas

```js
// Pública — qualquer um acessa
routes.get("/", productsControllers.getProducts.bind(productsControllers));

// Autenticado — precisa de token válido
routes.get("/me", authToken, authControllers.getUser.bind(authControllers));

// Admin — precisa de token + role ADMIN
routes.post("/", authToken, authAdminOnly, productsControllers.createProduct.bind(productsControllers));
```

---

## Validação com Zod

### globalValidators.js — usado em todos os módulos

```js
export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido."),
});
// z.coerce converte "123" (string que vem da URL) para número automaticamente
```

### Como validar parâmetros de URL nos Controllers

```js
const { id } = req.params; // vem como string: "42"
const validation = idParamsSchema.safeParse({ id }); // coerce converte pra 42

if (!validation.success) {
  return res.status(400).json({ error: validation.error.format() });
}

// validation.data.id já é número
await productsServices.delete(validation.data.id);
```

### passwordSchema — reutilizado em authValidators e userValidators

```js
const passwordSchema = z
  .string()
  .min(8, "Senha mínima 8 caracteres.")
  .regex(/[A-Z]/, "Senha deve ter pelo menos uma letra maiúscula.")
  .regex(/[a-z]/, "Senha deve ter pelo menos uma letra minúscula.")
  .regex(/[0-9]/, "Senha deve ter pelo menos um número.");
```

### updateProductSchema — partial() para atualizações parciais

```js
export const productSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(3).max(100),
  // ...todos os campos obrigatórios
});

// partial() torna todos os campos opcionais — perfeito pra PATCH
export const updateProductSchema = productSchema.partial();
```

---

## Utils — Funções Reutilizáveis

### getRequeridEnv.js

Garante que variáveis de ambiente obrigatórias existem. Se faltar, o servidor não sobe:

```js
export const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or empty required environment variable: ${name}`);
  }
  return value;
};

// Uso nos outros utils:
const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const SALT = parseInt(getRequiredEnv("SALT"));
```

### generateSlug.js

Transforma nomes em slugs para URLs. Chamado nos Services de categorias e produtos:

```js
export const generateSlug = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // remove acentos
    .replace(/[^a-z0-9\s-]/g, "")    // remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-");            // espaços viram hífens
};

// "Guitarras Elétricas" → "guitarras-eletricas"
```

### generateHashPassword.js e compareHashPassword.js

```js
// Gerar hash — usado no register e createUser
const hashPassword = await generateHashPassword(password);

// Comparar — usado no login e updatePassword
const isMatch = await compareHashPassword(senhaDigitada, hashDoBanco);
if (!isMatch) throw new Error("Senha inválida.");
```

---

## Segurança

### Regras aplicadas no projeto

| Regra | Onde está implementada |
|-------|----------------------|
| Senha nunca salva em texto puro | `generateHashPassword.js` com bcrypt |
| Senha nunca retorna nas respostas | `select` no Prisma sem o campo `password` |
| Token JWT com `isActive` embutido | `generateToken.js` |
| Usuário desativado bloqueado mesmo com token válido | `authToken` middleware |
| Email normalizado antes de salvar | `.toLowerCase().trim()` nos Services |
| Erro genérico no login | "Email ou senha inválidos." — não revela se o email existe |
| Variáveis de ambiente obrigatórias verificadas | `getRequeridEnv.js` |
| `select` explícito no Prisma | Todos os Services |

### Use o ID do token, nunca do body

```js
// ✅ Correto — usa o ID do token JWT (confiável)
const id = req.user.id;
const updatedUser = await userService.update(id, validation.data);

// ❌ Errado — usuário poderia mandar qualquer ID no body
const { id } = req.body;
```

### allowedFields nos Services de update

Filtrar campos explicitamente evita que alguém atualize campos que não deveria (como `role` via rota errada):

```js
const allowedFields = ["name", "email"];
const data = Object.fromEntries(
  Object.entries(body).filter(([key]) => allowedFields.includes(key))
);
if (Object.keys(data).length === 0) throw new Error("Nenhum campo para atualizar.");
```

---

## Tratamento de Erros

### Fluxo atual

Controllers usam `try/catch` e passam erros para o Express via `next(error)`.

**⚠️ Ponto de atenção:** O `app.js` ainda não tem middleware de erro global. Sem ele, o Express não sabe o que fazer com os erros passados via `next(error)`.

### Adicionar no app.js — DEPOIS de todas as rotas

```js
// src/app.js — adicionar no final, após app.use("/products", productsRoutes)

// Middleware de erro global (4 parâmetros — o Express reconhece por isso)
app.use((error, req, res, next) => {
  console.error(error);

  if (error.message) {
    return res.status(400).json({ message: error.message });
  }

  res.status(500).json({ message: "Erro interno no servidor." });
});
```

### Padrão de resposta de erro

```json
// Erro de validação Zod (400)
{ "error": { "name": { "_errors": ["Nome mínimo 3 caracteres."] } } }

// Erro de negócio (400)
{ "message": "Email já cadastrado." }

// Sem autenticação (401)
{ "message": "Token não fornecido" }

// Sem permissão (403)
{ "message": "Acesso admin negado." }
```

### Códigos HTTP usados

| Código | Quando usar |
|--------|-------------|
| `200` | Sucesso em GET, PATCH |
| `201` | Criação bem-sucedida (POST) |
| `400` | Dados inválidos (Zod) ou erro de regra de negócio |
| `401` | Sem token, token inválido/expirado, usuário desativado |
| `403` | Autenticado mas sem permissão (não é ADMIN) |
| `404` | Recurso não encontrado |
| `500` | Erro inesperado no servidor |

---

## Variáveis de Ambiente

### .env.example — versão corrigida

O `.env.example` atual está faltando `SALT`, que é usado em `generateHashPassword.js`:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
FRONTEND_URL=
PORT=
SALT=
```

### Valores recomendados para desenvolvimento

```env
DATABASE_URL="postgresql://postgres:suasenha@localhost:5432/mydb"
JWT_SECRET="uma-string-longa-aleatoria-de-pelo-menos-32-caracteres"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:5173"
PORT=3000
SALT=10
```

> `SALT=10` é o custo do bcrypt. O número 10 é o padrão recomendado — seguro sem ser lento.

---

## Rotas da API

### Autenticação `/auth`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/auth/register` | Público | Registrar usuário |
| POST | `/auth/login` | Público | Login e receber token |
| GET | `/auth/me` | `authToken` | Perfil do usuário logado |

### Usuários `/users`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| POST | `/users` | `authToken + authAdminOnly` | Admin cria usuário com role |
| PATCH | `/users/update/me` | `authToken` | Atualiza nome/email próprio |
| PATCH | `/users/update/password` | `authToken` | Atualiza senha própria |
| PATCH | `/users/update/:id/role` | `authToken + authAdminOnly` | Muda role de um usuário |
| PATCH | `/users/toggle/:id` | `authToken + authAdminOnly` | Ativa/desativa usuário |

### Categorias `/categories`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/categories` | Público | Listar ou buscar por `?slug=` |
| POST | `/categories` | `authToken + authAdminOnly` | Criar categoria |
| PATCH | `/categories/update/:id` | `authToken + authAdminOnly` | Atualizar categoria |
| DELETE | `/categories/:id` | `authToken + authAdminOnly` | Deletar categoria |

### Produtos `/products`

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| GET | `/products` | Público | Listar com filtros `?category=&search=` |
| GET | `/products/:id` | Público | Produto por ID (inclui imagens) |
| POST | `/products` | `authToken + authAdminOnly` | Criar produto |
| PATCH | `/products/update/:id` | `authToken + authAdminOnly` | Atualizar produto |
| DELETE | `/products/:id` | `authToken + authAdminOnly` | Deletar produto |

---

## Próximos módulos a implementar

Siga essa ordem — cada fase depende da anterior:

```
Fase 4 — Endereços
  [ ] POST   /users/me/address         Adicionar endereço
  [ ] GET    /users/me/address         Listar endereços
  [ ] DELETE /users/me/address/:id     Deletar endereço

Fase 5 — Carrinho
  [ ] GET    /cart                     Ver carrinho (cria automaticamente se não existir)
  [ ] POST   /cart/items               Adicionar item
  [ ] PATCH  /cart/items/:id           Atualizar quantidade
  [ ] DELETE /cart/items/:id           Remover item

Fase 6 — Pedidos
  [ ] POST   /orders                   Finalizar compra (endereço + itens do carrinho)
  [ ] GET    /orders                   Meus pedidos
  [ ] GET    /orders/:id               Detalhe de um pedido
  [ ] PATCH  /orders/:id/status        Admin atualiza status
```

### Template para um novo módulo

```
1. src/validators/cartValidators.js    → schemas Zod
2. src/services/cartServices.js        → lógica + Prisma
3. src/controllers/cartControllers.js  → validação + chamada ao service
4. src/routes/cartRoutes.js            → endpoints + middlewares
5. Registrar em src/app.js:
   import cartRoutes from "./routes/cartRoutes.js";
   app.use("/cart", cartRoutes);
6. Testar no Insomnia/Postman antes de seguir
```

---

## Bugs conhecidos e pontos de atenção

### 1. `app.js` sem middleware de erro global

Erros passados via `next(error)` não têm tratamento centralizado. Adicione o middleware de 4 parâmetros no final do `app.js` (veja a seção de tratamento de erros acima).

### 2. Typo no `categoriesControllers.js`

Na função `updatedCategory`, o catch tem `nex(error)` em vez de `next(error)`:

```js
// ❌ como está
} catch (error) {
  nex(error); // vai quebrar
}

// ✅ correto
} catch (error) {
  next(error);
}
```

### 3. `SALT` faltando no `.env.example`

A variável `SALT` é usada em `generateHashPassword.js` mas não está documentada no `.env.example`. Adicione para não quebrar o projeto quando outro dev clonar.

### 4. Typo no nome do arquivo utils

O arquivo se chama `getRequeridEnv.js` (faltou o `i` em `Required`). Não causa erro funcional, mas é confuso. Se quiser corrigir, atualize todos os imports junto.

### 5. Verificar nomes dos arquivos de Services

Os arquivos se chamam `authServices.js` e `userServices.js` (plural). Confirme que todos os imports nos controllers estão apontando para o nome correto — um erro aqui causa `Cannot find module` em tempo de execução.

---

> 💡 **Dica:** Teste cada rota no Insomnia/Postman assim que terminar de implementá-la. Não acumule módulos sem testar — fica muito mais difícil achar o bug depois.

> 💡 **Dica — Carrinho:** Cada usuário tem **um único carrinho** (`Cart_userId_key` é `UNIQUE` no banco). Ao implementar, se o carrinho não existir, crie automaticamente. Ao finalizar o pedido, esvazie o carrinho depois de criar o `Orders`.
