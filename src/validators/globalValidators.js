import { z } from "zod";

export const idParamsSchema = z.object({
    id: z.string().min(1, "ID inválido."),
});