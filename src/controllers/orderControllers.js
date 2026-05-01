import orderServices from "../services/orderServices.js";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/orderValidators.js";
import { idParamsSchema } from "../validators/globalValidators.js";

class OrderControllers {
  async createOrder(req, res, next) {
    try {
      const validation = createOrderSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const order = await orderServices.createOrder(req.user.id, validation.data.addressId);

      res.status(201).json({ message: "Pedido criado com sucesso.", order });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const isAdmin = req.user.role === "ADMIN";
      const orders = await orderServices.getOrders(req.user.id, isAdmin);

      res.status(200).json({ orders });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const isAdmin = req.user.role === "ADMIN";
      const order = await orderServices.getOrderById(validation.data.id, req.user.id, isAdmin);

      res.status(200).json({ order });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const validationId = idParamsSchema.safeParse({ id: req.params.id });
      const validation = updateOrderStatusSchema.safeParse(req.body);

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const order = await orderServices.updateOrderStatus(validationId.data.id, validation.data.orderStatus);

      res.status(200).json({ message: "Status atualizado.", order });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const validation = idParamsSchema.safeParse({ id: req.params.id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const isAdmin = req.user.role === "ADMIN";
      const order = await orderServices.cancelOrder(validation.data.id, req.user.id, isAdmin);

      res.status(200).json({ message: "Pedido cancelado.", order });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderControllers();