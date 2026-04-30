import categoriesServices from "../services/categoriesServices.js";
import { categoryCreateSchema, categoryUpdateSchema } from "../validators/categoriesValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class CategoriesControllers {
  async createCategory(req, res, next) {
    try {
      const validation = categoryCreateSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { name } = validation.data;

      const createdCategory = await categoriesServices.create(name);

      res.status(201).json({ message: "Categoria criada com sucesso.", createdCategory });
    } catch (error) {
      next(error);
    }
  }

  async updatedCategory(req, res, next) {
    try {
      const { id } = req.params;

      const validationId = idParamsSchema.safeParse({ id });

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      const validation = categoryUpdateSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const updatedCategory = await categoriesServices.update(validationId.data.id, validation.data);

      res.status(200).json({ message: "Categoria atualizada com sucesso.", updatedCategory });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const deletedCategory = await categoriesServices.delete(validation.data.id);

      res.status(200).json({ message: "Categoria deletada com sucesso.", deletedCategory });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req, res, next) {
    try {
      const { slug } = req.query;

      const categories = await categoriesServices.get({ slug });

      res.status(200).json({ categories });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoriesControllers();