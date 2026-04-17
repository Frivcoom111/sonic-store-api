import z, { email } from "zod";

export const registerSchema = z.object({
    name: z.string().min(3, "Nome minimo 3 dígitos.").max(100, "Nome máximo 100 dígitos."),
    email: z.string().email("Email inválido."),
    password: z.string().min(8, "Senha minimo 8 dígitos."), 
})

export const loginSchema = z.object({
    email: z.string().email("Email inválido."),
    password: z.string().min(8, "Senha inválida.")
})