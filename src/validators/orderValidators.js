import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().min(1, "addressId inválido."),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"], {
    errorMap: () => ({ message: "Status inválido." }),
  }),
});
