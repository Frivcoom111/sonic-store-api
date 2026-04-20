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

    
  }
}

export default new CategoriesService();
