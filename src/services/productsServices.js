import prisma from "../lib/prisma.js";
import { generateSlug } from "../utils/generateSlug.js";
import { createError } from "../utils/createError.js";

const productSelect = {
  id: true,
  name: true,
  mark: true,
  description: true,
  price: true,
  stock: true,
  imageUrl: true,
  slug: true,
  category: { select: { name: true, slug: true } },
};

class ProductsService {
  async create(data) {
    try {
      const { categoryId, name, mark, description, price, stock, imageUrl } = data;

      return await prisma.product.create({
        data: { categoryId, name, mark, description, price, stock, imageUrl, slug: generateSlug(name) },
        select: productSelect,
      });
    } catch (error) {
      if (error.code === "P2002") throw createError("Já existe um produto com esse nome.", 409);
      if (error.code === "P2003") throw createError("Categoria não encontrada.", 404);
      throw error;
    }
  }

  async update(id, data) {
    const allowedFields = ["categoryId", "name", "mark", "description", "price", "stock", "imageUrl"];
    const updateData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));

    if (Object.keys(updateData).length === 0) throw createError("Nenhum campo para atualizar.", 400);

    if (updateData.name) updateData.slug = generateSlug(updateData.name);

    try {
      return await prisma.product.update({
        where: { id },
        data: updateData,
        select: productSelect,
      });
    } catch (error) {
      if (error.code === "P2025") throw createError("Produto não encontrado.", 404);
      if (error.code === "P2002") throw createError("Já existe um produto com esse nome.", 409);
      if (error.code === "P2003") throw createError("Categoria não encontrada.", 404);
      throw error;
    }
  }

  async delete(id) {
    try {
      return await prisma.product.delete({
        where: { id },
        select: { id: true, name: true, slug: true },
      });
    } catch (error) {
      if (error.code === "P2025") throw createError("Produto não encontrado.", 404);
      if (error.code === "P2003") throw createError("Produto possui pedidos ou itens de carrinho vinculados.", 409);
      throw error;
    }
  }

  async getAll({ categorySlug, search } = {}) {
    const where = {};

    if (categorySlug) where.category = { slug: categorySlug };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mark: { contains: search, mode: "insensitive" } },
      ];
    }

    return await prisma.product.findMany({
      where,
      select: productSelect,
      orderBy: { name: "asc" },
    });
  }

  async getById(id) {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        ...productSelect,
        images: { select: { id: true, url: true } },
      },
    });

    if (!product) throw createError("Produto não encontrado.", 404);

    return product;
  }
}

export default new ProductsService();
