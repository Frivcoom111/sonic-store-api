import prisma from "../lib/prisma.js";
import { generateSlug } from "../utils/generateSlug.js";

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
    const { categoryId, name, mark, description, price, stock, imageUrl } = data;

    return await prisma.product.create({
      data: { categoryId, name, mark, description, price, stock, imageUrl, slug: generateSlug(name) },
      select: productSelect,
    });
  }

  async update(id, data) {
    const allowedFields = ["categoryId", "name", "mark", "description", "price", "stock", "imageUrl"];
    const updateData = Object.fromEntries(Object.entries(data).filter(([key]) => allowedFields.includes(key)));

    if (Object.keys(updateData).length === 0) throw new Error("Nenhum campo para atualizar.");

    if (updateData.name) updateData.slug = generateSlug(updateData.name);

    return await prisma.product.update({
      where: { id },
      data: updateData,
      select: productSelect,
    });
  }

  async delete(id) {
    return await prisma.product.delete({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
  }

  async getAll({ categorySlug, search } = {}) {
    const where = {};

    if (categorySlug) where.category = { slug: categorySlug };

    if (search) {
      where.OR = [{ name: { contains: search, mode: "insensitive" } }, { mark: { contains: search, mode: "insensitive" } }];
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

    if (!product) throw new Error("Produto não encontrado.");

    return product;
  }
}

export default new ProductsService();
