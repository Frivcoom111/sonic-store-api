import prisma from "../lib/prisma.js";
import { compareHashPassword } from "../utils/compareHashPassword.js";
import { generateHashPassword } from "../utils/generateHashPassword.js";
import { generateToken } from "../utils/generateToken.js";
import { createError } from "../utils/createError.js";
import type { Prisma } from "../generated/prisma/client.js";
import type {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from "../interfaces/auth.interface.js";
import type { UserResponse } from "../interfaces/user.interface.js";

class AuthService {
  async register({ name, email, password }: RegisterDTO): Promise<UserResponse> {
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
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      return user;
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
        throw createError("Email já cadastrado.", 409);
      }
      throw error;
    }
  }

  async login({ email, password }: LoginDTO): Promise<LoginResponse> {
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

  async getUser(id: string): Promise<UserResponse> {
    if (!id) throw createError("ID inválido.", 400);

    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (!user.isActive) throw createError("Usuário inativo.", 403);

    return user;
  }
}

export default new AuthService();