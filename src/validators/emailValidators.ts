import { z } from "zod";

export const verifyEmailSchema = z.object({
    code: z.string().min(6, "Código inválido.").max(6, "Código inválido.")
});