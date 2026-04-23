import { z } from "zod";

export const productImageSchema = z.object({
  url: z.string().url("URL de imagem inválida."),
});
