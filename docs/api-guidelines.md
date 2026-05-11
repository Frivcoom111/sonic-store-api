# API Template — Orientações e Regras de Desenvolvimento

Este documento descreve as convenções, padrões e regras que **toda refatoração ou nova funcionalidade deve seguir**.

---

## 1. Arquitetura em Camadas

A API segue uma separação estrita de responsabilidades em 4 camadas:

```
Route → Controller → Service → Prisma (banco)
```

| Camada | Responsabilidade |
|--------|-----------------|
| **Route** (`src/routes/`) | Registra endpoints, aplica middlewares (auth, rate limit) |
| **Controller** (`src/controllers/`) | Valida o corpo da requisição com Zod, chama o Service, retorna a resposta HTTP |
| **Service** (`src/services/`) | Contém a lógica de negócio e acessa o Prisma |
| **Prisma** (`src/lib/prisma.ts`) | Instância singleton do cliente Prisma |

**Regra:** Nenhuma camada deve pular outra. Controller nunca acessa Prisma diretamente. Service nunca acessa `req`/`res`.

---

## 2. Controllers

- São **classes** com métodos `async`, exportados como singleton (`export default new XController()`).
- Cada método segue exatamente esta sequência:
  1. Validar entrada com `schema.safeParse(req.body)` ou `idParamsSchema.safeParse(req.params)`.
  2. Retornar `res.status(400).json({ error: validation.error.format() })` em caso de falha.
  3. Tipar os dados validados com a interface DTO correspondente.
  4. Chamar o método do service.
  5. Retornar o JSON de sucesso.
  6. `catch (error) → next(error)`.

```ts
// Padrão obrigatório de controller
async create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validation = createSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ error: validation.error.format() });
      return;
    }
    const data: CreateDTO = validation.data;
    const result = await xService.create(data);
    res.status(201).json({ message: "...", result });
  } catch (error) {
    next(error);
  }
}
```

---

## 3. Services

- São **classes** com métodos `async`, exportados como singleton.
- Toda lógica de negócio e acesso ao banco fica aqui.
- Erros de negócio são lançados via `createError(message, statusCode)` — **nunca** `throw new Error()` puro.
- Erros do Prisma (ex: `P2002` — unique constraint) são capturados no service e convertidos em `AppError`.

```ts
// Tratamento correto de erro Prisma no service
} catch (error) {
  if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
    throw createError("Recurso já existe.", 409);
  }
  throw error;
}
```

**Regra:** `P2003` (FK violation) nunca deve vazar para o controller — o service deve verificar dependências antes de deletar. Veja [deletion-strategy.md](./deletion-strategy.md).

---

## 4. Tratamento de Erros

- `src/utils/createError.ts` cria um `AppError` (Error com campo `status`).
- `src/middlewares/errorMiddlewares.ts` é o **único** handler de erro e deve ser registrado por último em `app.ts`.
- Erros 5xx são logados com `console.error`. Erros 4xx não são logados.
- A resposta de erro sempre tem o formato `{ "error": "mensagem" }`.

```ts
// Nunca retorne detalhes internos ou stack trace ao cliente
res.status(status).json({ error: message });
```

---

## 5. Validação com Zod

- Cada domínio tem seu próprio arquivo em `src/validators/`.
- Schemas são nomeados `<ação>Schema` (ex: `registerSchema`, `updateProductSchema`).
- O schema de parâmetro de ID é compartilhado: `idParamsSchema` em `src/validators/globalValidators.ts`.
- **Nunca** use `schema.parse()` em controllers — use sempre `schema.safeParse()` para controlar o erro manualmente.
- Regras de senha obrigatórias: mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número.

---

## 6. Autenticação e Autorização

- JWT Bearer Token no header `Authorization: Bearer <token>`.
- `authToken` middleware: valida o token, busca o usuário no banco (confirma `isActive`) e injeta `req.user = { id, role, isActive }`.
- `authAdminOnly` middleware: verifica `req.user.role === "ADMIN"`, deve ser usado **após** `authToken`.
- O tipo de `req.user` está declarado em `src/types/express.d.ts`.

```ts
// Ordem correta de middlewares em rotas protegidas
router.patch("/admin/...", authToken, authAdminOnly, controller.method);
```

---

## 7. Segurança (app.ts)

As seguintes proteções estão ativas e **não devem ser removidas**:

| Proteção | Configuração |
|----------|-------------|
| `helmet()` | Cabeçalhos HTTP de segurança |
| `cors()` | Restrito ao `FRONTEND_URL` do `.env` |
| Rate limit global | 100 req / 15 min por IP |
| Rate limit em `/auth` | 10 req / 15 min por IP |
| `express.json({ limit: "10kb" })` | Bloqueia payloads grandes |
| Swagger desativado em produção | `NODE_ENV !== 'production'` |

Variáveis de ambiente obrigatórias são acessadas via `getRequiredEnv()` — nunca via `process.env.VAR` direto, pois `getRequiredEnv` lança erro de inicialização caso a variável esteja ausente.

---

## 8. Banco de Dados (Prisma)

### Convenções do Schema

- IDs: `String @id @default(uuid())` — UUIDs em todos os modelos.
- Datas: `createdAt DateTime @default(now())` e `updatedAt DateTime @updatedAt` em todos os modelos principais.
- Preços: `Decimal @db.Decimal(10, 2)` — nunca `Float`.
- Slugs: gerados via `src/utils/generateSlug.ts`, únicos (`@unique`).
- `isActive Boolean @default(true)` para entidades com soft delete.

### Queries

- Use sempre `select` explícito no Prisma para **nunca** expor o campo `password` acidentalmente.
- Prefira `findUnique` quando buscar por `id` ou `email`.
- Verificações de existência antes de operações destrutivas ficam **no service**, não no controller.

---

## 9. Estratégia de Deleção

Detalhada em [deletion-strategy.md](./deletion-strategy.md). Resumo:

- **Soft delete** (`isActive = false`): User, Address (se tem Orders), Product (se tem OrderItems).
- **Hard delete com cascade**: CartItem, ProductImage.
- **Restrict (409)**: Category com Products vinculados.
- **Cancelamento de status**: Orders (nunca deletados, apenas `CANCELLED`).

---

## 10. Interfaces e Tipos

- Cada domínio tem interfaces em `src/interfaces/<domain>.interface.ts`.
- DTOs de entrada: sufixo `DTO` (ex: `RegisterDTO`, `CreateProductDTO`).
- DTOs de saída (resposta): sufixo `Response` (ex: `UserResponse`, `LoginResponse`).
- **Nunca** inclua `password` em nenhuma interface `Response`.

---

## 11. Estrutura de Arquivos

```
src/
├── app.ts                  # Express config, middlewares, rotas
├── server.ts               # Inicialização do servidor HTTP
├── config/swagger.ts       # Configuração do Swagger
├── controllers/            # Camada HTTP
├── services/               # Lógica de negócio
├── routes/                 # Registro de rotas e middlewares
├── middlewares/            # auth, error handler
├── validators/             # Schemas Zod por domínio
├── interfaces/             # DTOs e tipos de resposta
├── utils/                  # Funções puras auxiliares
├── lib/prisma.ts           # Instância singleton Prisma
└── types/express.d.ts      # Extensão do tipo Request
```

---

## 12. Checklist para Novos Endpoints

Antes de considerar um endpoint pronto:

- [ ] Rota registrada no arquivo correto em `src/routes/`.
- [ ] Middlewares de auth aplicados (`authToken` e/ou `authAdminOnly`).
- [ ] Schema Zod criado/atualizado no arquivo de validators do domínio.
- [ ] Controller usa `safeParse` e tipagem com interface DTO.
- [ ] Service usa `createError` para todos os erros de negócio.
- [ ] Nenhum campo sensível (`password`) exposto na resposta.
- [ ] Swagger JSDoc adicionado na rota (apenas se `NODE_ENV !== 'production'`).
- [ ] Lógica de deleção segue a [estratégia de deleção](./deletion-strategy.md).
