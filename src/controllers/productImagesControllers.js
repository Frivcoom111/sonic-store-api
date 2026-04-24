import productImagesServices from "../services/productImagesServices.js";
import { productImageSchema } from "../validators/productImagesValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class ProductImagesControllers {
  async getImages(req, res, next) {
    try {
      const { productId } = req.params;

      const validation = idParamsSchema.safeParse({ id: productId });
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const images = await productImagesServices.getByProduct(validation.data.id);

      res.status(200).json({ images });
    } catch (error) {
      next(error);
    }
  }

  async addImage(req, res, next) {
    try {
      const { productId } = req.params;

      const validationId = idParamsSchema.safeParse({ id: productId });
      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      const validation = productImageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const image = await productImagesServices.add(validationId.data.id, validation.data.url);

      res.status(201).json({ message: "Imagem adicionada com sucesso.", image });
    } catch (error) {
      next(error);
    }
  }

  async removeImage(req, res, next) {
    try {
      const { productId, imageId } = req.params;

      const validationProductId = idParamsSchema.safeParse({ id: productId });
      const validationImageId = idParamsSchema.safeParse({ id: imageId });

      if (!validationProductId.success) {
        return res.status(400).json({ error: validationProductId.error.format() });
      }

      if (!validationImageId.success) {
        return res.status(400).json({ error: validationImageId.error.format() });
      }

      const image = await productImagesServices.remove(validationProductId.data.id, validationImageId.data.id);

      res.status(200).json({ message: "Imagem removida com sucesso.", image });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductImagesControllers();
