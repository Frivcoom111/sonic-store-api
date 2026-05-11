# Estratégia de Deleção — Sonic Store API

## Princípio Geral

Toda operação de DELETE da API segue **dois passos** nessa ordem:

1. **Verificar dependências antes** de tentar a deleção (evita `P2003` vazando do Prisma).
2. **Decidir entre hard delete e soft delete** com base no tipo de dependência:
   - Dependências **históricas/legais** (Orders, OrderItem) → soft delete (`isActive = false`).
   - Dependências **transitórias** (CartItem, ProductImage) → cascade delete pelo banco.
   - Dependências **bloqueantes** (Category com Products) → 409 Conflict.

FK constraints com `onDelete` no schema são a **segunda camada de defesa** — não a primeira.

## Regras por Entidade

| Entidade | Estratégia | Comportamento ao chamar DELETE |
|----------|-----------|-------------------------------|
| **User** | Soft delete via `PATCH /users/toggle/:id` | Não há endpoint hard delete. `isActive=false` desativa o usuário. |
| **Address** | Smart (soft se tem Orders, hard se não tem) | Se tem `Orders` vinculados → `isActive=false`. Senão → DELETE físico. |
| **Product** | Smart (soft se tem OrderItems, hard se não tem) | Se tem `OrderItem` → `isActive=false` + remove dos carrinhos. Senão → DELETE físico (cascade em `ProductImage`). |
| **Category** | Restrict | Bloqueia com **409** se tiver produtos vinculados. |
| **Orders** | Status update (não deleta) | `DELETE /orders/:id` chama `cancelOrder` → `orderStatus=CANCELLED` + restaura estoque. |
| **OrderItem** | Cascade com Orders | Não tem endpoint próprio. Some quando Order é deletado (não acontece em produção). |
| **ProductImage** | Cascade com Product | Hard delete sempre. Some junto com Product quando hard-deletado. |
| **Cart** | Cascade com User | Some quando o User é hard-deletado (não acontece em produção). |
| **CartItem** | Cascade com Cart e Product | Hard delete sempre. Some quando Cart é deletado ou Product é hard-deletado. |

## FK Constraints (`onDelete` no schema)

Estas regras ficam no [prisma/schema.prisma](../prisma/schema.prisma) como segunda camada:

| Tabela.Coluna | Referência | onDelete | Razão |
|---------------|-----------|----------|-------|
| `Address.userId` | `User.id` | `Restrict` | User só é desativado, nunca deletado. |
| `Product.categoryId` | `Category.id` | `Restrict` | Garante que Category com produtos não seja deletada. |
| `ProductImage.productId` | `Product.id` | `Cascade` | Imagens são parte do produto. |
| `Cart.userId` | `User.id` | `Cascade` | Carrinho não tem valor sem dono. |
| `CartItem.cartId` | `Cart.id` | `Cascade` | Item pertence ao carrinho. |
| `CartItem.productId` | `Product.id` | `Cascade` | Carrinho transitório, sem requisito histórico. |
| `Orders.userId` | `User.id` | `Restrict` | Histórico de pedidos. |
| `Orders.addressId` | `Address.id` | `Restrict` | Endereço histórico do pedido. |
| `OrderItem.orderId` | `Orders.id` | `Cascade` | Itens pertencem ao pedido. |
| `OrderItem.productId` | `Product.id` | `Restrict` | Produto histórico. Por isso products viram soft-delete. |

## Como Aplicar a Migração

1. Regenerar tipos do Prisma (resolve erros de TypeScript em `isActive`):
   ```bash
   npx prisma generate
   ```

2. Criar e aplicar a migração:
   ```bash
   npx prisma migrate dev --name deletion_strategy
   ```

A migração esperada vai conter:

```sql
-- Adicionar coluna isActive em Address e Product
ALTER TABLE "Address" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Recriar FKs com onDelete explícito
ALTER TABLE "Address" DROP CONSTRAINT "Address_userId_fkey";
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;

ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT;

ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;

ALTER TABLE "Cart" DROP CONSTRAINT "Cart_userId_fkey";
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_cartId_fkey";
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey"
  FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE;

ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;

ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT;

ALTER TABLE "Orders" DROP CONSTRAINT "Orders_addressId_fkey";
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_addressId_fkey"
  FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT;

ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Orders"("id") ON DELETE CASCADE;

ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT;
```

## Exemplos de Uso

### 1. Address sem pedidos vinculados (hard delete)

```http
DELETE /addresses/abc-123
Authorization: Bearer <token>
```

**200 OK:**
```json
{
  "message": "Endereço removido com sucesso.",
  "softDeleted": false
}
```

### 2. Address com pedidos vinculados (soft delete automático)

```http
DELETE /addresses/abc-123
Authorization: Bearer <token>
```

**200 OK:**
```json
{
  "message": "Endereço desativado. Pedidos vinculados foram preservados.",
  "softDeleted": true
}
```

Frontend deve esconder o endereço da listagem mas manter o `addressId` referenciado nos pedidos antigos.

### 3. Product com OrderItems (soft delete automático)

```http
DELETE /products/xyz-789
Authorization: Bearer <admin-token>
```

**200 OK:**
```json
{
  "message": "Produto desativado. Pedidos históricos foram preservados.",
  "softDeleted": true,
  "product": { "id": "xyz-789", "name": "Sony WH-1000XM5", "slug": "sony-wh-1000xm5" }
}
```

Após isso:
- `GET /products` não lista mais o produto.
- `GET /products/xyz-789` retorna 404.
- Pedidos antigos continuam mostrando o produto via snapshot em `OrderItem` (`priceAtTime`, `productId`).
- Carrinhos foram limpos de qualquer item desse produto.

### 4. Category com produtos (bloqueio)

```http
DELETE /categories/cat-001
Authorization: Bearer <admin-token>
```

**409 Conflict:**
```json
{ "error": "Categoria possui produtos vinculados." }
```

Frontend deve mostrar mensagem ao admin sugerindo mover ou deletar os produtos antes.

### 5. Cancelamento de pedido (não é DELETE de fato)

```http
DELETE /orders/ord-555
Authorization: Bearer <token>
```

**200 OK:**
```json
{
  "message": "...",
  "order": { "id": "ord-555", "orderStatus": "CANCELLED", "...": "..." }
}
```

Pedidos não são deletados — apenas marcados como `CANCELLED` e o estoque restaurado. Apenas pedidos em status `PENDING` podem ser cancelados.

## Como o Frontend Deve Interpretar os Erros

| Status | Significado | UI sugerida |
|--------|-------------|-------------|
| 200 + `softDeleted: false` | Recurso removido fisicamente. | "Removido com sucesso." |
| 200 + `softDeleted: true` | Recurso desativado, dependências preservadas. | "Removido. Histórico mantido." |
| 404 | Recurso não existe ou já foi removido. | "Não encontrado." |
| 403 | Recurso pertence a outro usuário. | "Sem permissão." |
| 409 | Bloqueado por dependências (ex: categoria com produtos). | Mostrar mensagem do `error` literal — orienta o admin. |
| 500 | Bug não tratado. | "Erro interno." (e logar para investigar) |

## Convenções para Novos Endpoints DELETE

Sempre que adicionar um novo DELETE:

1. Identifique relações no [schema.prisma](../prisma/schema.prisma).
2. Decida: a entidade tem requisito histórico/legal? → soft delete (adicione `isActive`).
3. Decida: a entidade tem filhos transitórios? → `onDelete: Cascade` no schema.
4. **No service**: cheque dependências antes de chamar `prisma.delete()`. Não deixe `P2003` vazar.
5. **No controller**: retorne `softDeleted` no JSON quando aplicável, para o frontend distinguir.
6. Atualize esta tabela.
