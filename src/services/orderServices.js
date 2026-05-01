import prisma from "../lib/prisma.js";
import { Prisma } from "../generated/prisma/client.js";
import { createError } from "../utils/createError.js";

class OrderService {
  async createOrder(userId, addressId) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });

    if (!address) throw createError("Endereço não encontrado.", 404);
    if (address.userId !== userId) throw createError("Endereço não pertence ao usuário.", 403);

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) throw createError("Carrinho vazio.", 400);

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        throw createError(`Estoque insuficiente para "${item.product.name}".`, 409);
      }
    }

    const total = cart.items.reduce(
      (sum, item) => sum.add(item.product.price.mul(item.quantity)),
      new Prisma.Decimal(0)
    );

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          userId,
          addressId,
          orderStatus: "PENDING",
          total,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtTime: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, imageUrl: true, slug: true } },
            },
          },
          address: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    return order;
  }

  async getOrders(userId, isAdmin) {
    const where = isAdmin ? {} : { userId };

    return await prisma.orders.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, slug: true } },
          },
        },
        address: true,
      },
    });
  }

  async getOrderById(id, userId, isAdmin) {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, slug: true } },
          },
        },
        address: true,
      },
    });

    if (!order) throw createError("Pedido não encontrado.", 404);
    if (!isAdmin && order.userId !== userId) throw createError("Acesso negado.", 403);

    return order;
  }

  async updateOrderStatus(id, orderStatus) {
    const order = await prisma.orders.findUnique({ where: { id } });

    if (!order) throw createError("Pedido não encontrado.", 404);

    return await prisma.orders.update({
      where: { id },
      data: { orderStatus },
      include: {
        items: {
          include: {
            product: { select: { id: true, name: true, imageUrl: true, slug: true } },
          },
        },
        address: true,
      },
    });
  }

  async cancelOrder(id, userId, isAdmin) {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw createError("Pedido não encontrado.", 404);
    if (!isAdmin && order.userId !== userId) throw createError("Acesso negado.", 403);
    if (order.orderStatus !== "PENDING") throw createError("Apenas pedidos PENDING podem ser cancelados.", 409);

    return await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return await tx.orders.update({
        where: { id },
        data: { orderStatus: "CANCELLED" },
      });
    });
  }
}

export default new OrderService();