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
    if (data.name) data.slug = generateSlug(data.name);

    try {
      return await prisma.product.update({
        where: { id },
        data,
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

  async getAll({ categorySlug, search, page = 1, limit = 20 } = {}) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;
    const where = {};

    if (categorySlug) where.category = { slug: categorySlug };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { mark: { contains: search, mode: "insensitive" } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        select: productSelect,
        orderBy: { name: "asc" },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, meta: { total, page, limit: take, totalPages: Math.ceil(total / take) } };
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