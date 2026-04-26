import cartServices from "../services/cartServices.js";
import { addCartItemSchema, updateCartItemSchema } from "../validators/cartValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class CartControllers {
  async getCart(req, res, next) {
    try {
      const cart = await cartServices.getCart(req.user.id);

      res.status(200).json({ cart });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req, res, next) {
    try {
      const validation = addCartItemSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { productId, quantity } = validation.data;

      const cart = await cartServices.addItem(req.user.id, productId, quantity);

      res.status(200).json({ message: "Item adicionado ao carrinho.", cart });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req, res, next) {
    try {
      const validationId = idParamsSchema.safeParse({ id: req.params.productId });
      const validation = updateCartItemSchema.safeParse(req.body);

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const cart = await cartServices.updateItem(req.user.id, validationId.data.id, validation.data.quantity);

      res.status(200).json({ message: "Quantidade atualizada.", cart });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req, res, next) {
    try {
      const validation = idParamsSchema.safeParse({ id: req.params.productId });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const cart = await cartServices.removeItem(req.user.id, validation.data.id);

      res.status(200).json({ message: "Item removido do carrinho.", cart });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      const cart = await cartServices.clearCart(req.user.id);

      res.status(200).json({ message: "Carrinho esvaziado.", cart });
    } catch (error) {
      next(error);
    }
  }
}

export default new CartControllers();
