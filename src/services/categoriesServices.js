import prisma from "../lib/prisma.js";
import { generateSlug } from "../utils/generateSlug.js";
import { createError } from "../utils/createError.js";

class CategoriesService {
  async create(name) {
    try {
      const categorySlug = generateSlug(name);

      const createdCategory = await prisma.category.create({
        data: {
          name: name,
          slug: categorySlug,
        },
        select: {
          name: true,
          slug: true,
        },
      });

      return createdCategory;
    } catch (error) {
      if (error.code === "P2002") throw createError("Categoria já existe.", 409);
      throw error;
    }
  }

  async update(id, body) {
    const allowedFields = ["name"];

    const data = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

    if (Object.keys(data).length === 0) throw createError("Nenhum campo para atualizar.", 400);

    if (data.name) data.slug = generateSlug(data.name);

    try {
      const updatedCategory = await prisma.category.update({
        where: { id: id },
        data,
        select: {
          name: true,
          slug: true,
        },
      });

      return updatedCategory;
    } catch (error) {
      if (error.code === "P2025") throw createError("Categoria não encontrada.", 404);
      if (error.code === "P2002") throw createError("Categoria já existe.", 409);
      throw error;
    }
  }

  async delete(id) {
    try {
      const deletedCategory = await prisma.category.delete({
        where: { id: id },
        select: {
          name: true,
          slug: true,
        },
      });

      return deletedCategory;
    } catch (error) {
      if (error.code === "P2025") throw createError("Categoria não encontrada.", 404);
      if (error.code === "P2003") throw createError("Categoria possui produtos vinculados.", 409);
      throw error;
    }
  }

  async get({ slug } = {}) {
    if (slug) {
      const category = await prisma.category.findUnique({
        where: { slug: slug },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });

      if (!category) throw createError("Categoria não encontrada.", 404);

      return category;
    }

    return await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }
}

export default new CategoriesService();
