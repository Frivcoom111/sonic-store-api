import z from "zod";

export const verifyEmailSchema = z.object({
    code: z.number().int("Código inválido.").min(100000, "Código inválido.").max(999999, "Código inválido.")
});