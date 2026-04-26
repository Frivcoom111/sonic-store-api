import prisma from "../lib/prisma.js";

class CartService {
  async #getOrCreateCart(userId) {
    return await prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async getCart(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      select: {
        id: true,
        items: {
          select: {
            id: true,
            quantity: true,
            product: {
              select: {
                id: true,
                name: true,
                mark: true,
                price: true,
                stock: true,
                imageUrl: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    if (!cart) return { id: null, items: [], total: "0.00" };

    const total = cart.items
      .reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
      .toFixed(2);

    return { ...cart, total };
  }

  async addItem(userId, productId, quantity) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    
    if (!product) throw new Error("Produto não encontrado.");
    if (product.stock < quantity) throw new Error("Estoque insuficiente.");
    if (quantity <= 0) throw new Error("Quantidade inválida.");

    const cart = await this.#getOrCreateCart(userId);

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    
    if (existingItem) {
      if (existingItem.quantity == quantity) throw new Error("Quantidade igual a do carrinho.");

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    return this.getCart(userId);
  }

  async updateItem(userId, productId, quantity) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw new Error("Carrinho não encontrado.");

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) throw new Error("Item não encontrado no carrinho.");

    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (product.stock < quantity) throw new Error("Estoque insuficiente.");
    if (quantity <= 0) throw new Error("Quantidade inválida.");

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity },
    });

    return this.getCart(userId);
  }

  async removeItem(userId, productId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw new Error("Carrinho não encontrado.");

    const item = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (!item) throw new Error("Item não encontrado no carrinho.");

    await prisma.cartItem.delete({ where: { id: item.id } });

    return this.getCart(userId);
  }

  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) throw new Error("Carrinho não encontrado.");

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

    return this.getCart(userId);
  }
}

export default new CartService();
