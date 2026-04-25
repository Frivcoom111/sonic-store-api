import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.number().int().positive("productId inválido."),
  quantity: z.number().int().min(1, "Quantidade mínima é 1."),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1, "Quantidade mínima é 1."),
});
