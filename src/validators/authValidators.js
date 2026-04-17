import z, { email } from "zod";

export const registerSchema = z.object({
    name: z.string().min(3, "Nome muito curto.").max(100, "Nome muito grande."),
    email: z.string().email("Email inválido."),
    password: z.string().min(8, "Senha muito curta."),
    role: z.string(),
})