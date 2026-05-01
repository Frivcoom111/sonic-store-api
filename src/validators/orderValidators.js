import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.number().int().positive("addressId inválido."),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"], {
    errorMap: () => ({ message: "Status inválido." }),
  }),
});
