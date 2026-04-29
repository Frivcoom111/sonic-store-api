import productsServices from "../services/productsServices.js";
import { productSchema, updateProductSchema } from "../validators/productsValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class ProductsControllers {
  async createProduct(req, res, next) {
    try {
      const validation = productSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const product = await productsServices.create(validation.data);

      res.status(201).json({ message: "Produto criado com sucesso.", product });
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;

      const validationId = idParamsSchema.safeParse({ id });

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      const validation = updateProductSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const product = await productsServices.update(validationId.data.id, validation.data);

      res.status(200).json({ message: "Produto atualizado com sucesso.", product });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const product = await productsServices.delete(validation.data.id);

      res.status(200).json({ message: "Produto deletado com sucesso.", product });
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const { category, search } = req.query;
      const parsedPage = Number.parseInt(req.query.page, 10);
      const parsedLimit = Number.parseInt(req.query.limit, 10);
      const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
      const limit = Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : 20;

      const result = await productsServices.getAll({ categorySlug: category, search, page, limit });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const product = await productsServices.getById(validation.data.id);

      res.status(200).json({ product });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductsControllers();

