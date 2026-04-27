import prisma from "../lib/prisma.js";
import { compareHashPassword } from "../utils/compareHashPassword.js";
import { generateHashPassword } from "../utils/generateHashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import { createError } from "../utils/createError.js";

class AuthService {
  async register({ name, email, password }) {
    try {
      const normalizedEmail = email.toLowerCase().trim();
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
      if (error.code === "P2002") throw createError("Email já cadastrado.", 409);
      throw error;
    }
  }

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw createError("Email ou senha inválidos.", 401);
    if (!user.isActive) throw createError("Usuário inativo.", 403);

    const isMatch = await compareHashPassword(password, user.password);
    if (!isMatch) throw createError("Email ou senha inválidos.", 401);

    const token = generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  async getUser(id) {
    if (!id) throw createError("ID inválido.", 400);

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
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

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (!user.isActive) throw createError("Usuário inativo.", 403);

    return user;
  }
}

export default new AuthService();
