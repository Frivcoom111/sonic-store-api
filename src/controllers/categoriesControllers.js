import categoriesServices from "../services/categoriesServices.js";
import { categorySchema } from "../validators/categoriesValidators.js";

class CategoriesControllers {
  async createCategory(req, res, nex) {
    try {
      const validation = categorySchema.safeParse(req.body);

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
}

export default new CategoriesControllers();
