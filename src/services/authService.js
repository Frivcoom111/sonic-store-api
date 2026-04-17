import { empty } from "@prisma/client/runtime/client";
import prisma from "../lib/prisma.js";
import { compareHashPassword } from "../utils/compareHashPassword.js";
import { generateHashPassword } from "../utils/generateHashPassword.js";
import { generateToken } from "../utils/generateToken.js";
class AuthService {
  async register({ name, email, password }) {
    try {
      // Validação dos dados.
      if (!name || !email || !password) {
        throw new Error("Todos os campos são obrigatórios.");
      }

      // Normalizando o email
      const normalizedEmail = email.toLowerCase().trim();

      // Gera hash da senha.
      const hashPassword = await generateHashPassword(password);

      const user = await prisma.user.create({
        data: {
          name: name,
          email: normalizedEmail,
          password: hashPassword,
          role: "USER",
        },
        select: {
          name: true,
          email: true,
          role: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === "P2002") {
        // código Prisma pra unique constraint
        throw new Error("Email já cadastrado.");
      }

      throw error;
    }
  }

  async login({ email, password }) {
    // Validação dos dados.
    if (!email || !password)
      throw new Error("Todos os campos são obrigatórios.");

    // Normalizando o email
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    // Validação se o usuário existe.
    if (!user) throw new Error("Email ou senha inválidos.");

    // Validação senha.
    const isMatch = await compareHashPassword(password, user.password);
    if (!isMatch) throw new Error("Email ou senha inválidos.");

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getUser(id) {
    // Validação dos dados.
    if (!id) throw new Error("ID inválido.");

    // Buscando usuário e endereço do usuário.
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        role: true,
        addresses: {
          select: {
            state: true,
            city: true,
            street: true,
            complement: true,
            number: true,
          },
        },
      },
    });

    if (!user) throw new Error("Erro ao buscar usuário.");

    return user;
  }
}

export default new AuthService();
