import prisma from "../lib/prisma.js";
import { generateSlug } from "../utils/generateSlug.js";

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
      if (error.code === "P2002") {
        throw new Error("Categoria já existe.");
      }
      throw error;
    }
  }

  async update(id, body) {
    const allowedFields = ["name"];

    const data = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

    if (Object.keys(data).length === 0) throw new Error("Nenhum campo para atualizar.");

    if (data.name) data.slug = generateSlug(data.name);

    const updatedCategory = await prisma.category.update({
      where: {
        id: id,
      },
      data,
      select: {
        name: true,
        slug: true
      }
    })

    return updatedCategory;
  }

  async delete(id) {
    const deletedCategory = await prisma.category.delete({
      where: {
        id: id
      },
      select: {
        name: true,
        slug: true,
      }
    });

    return deletedCategory;
  }

  async get({ slug } = {}) {
    if (slug) {
      const category = await prisma.category.findUnique({
        where: {
          slug: slug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        }
      });

      if (!category) throw new Error("Categoria não encontrada.");

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
