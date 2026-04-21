import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, "Nome mínimo 3 caracteres.").max(100, "Nome máximo 100 caracteres."),
});

