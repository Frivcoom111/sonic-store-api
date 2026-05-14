import prisma from "../lib/prisma";
import { generateHashPassword } from "../utils/generateHashPassword";
import { compareHashPassword } from "../utils/compareHashPassword";
import { createError } from "../utils/createError";
import type { Prisma } from "../generated/prisma/client";
import type {
  CreateUserDTO,
  ToggleUserDTO,
  UpdateUserDTO,
  UpdateUserPasswordDTO,
  UpdateUserRoleDTO,
  UserListResponse,
  UserResponse,
} from "../interfaces/user.interface";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
} as const;

class UserService {
  async create({ name, email, password, role }: CreateUserDTO): Promise<UserResponse> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const hashPassword = await generateHashPassword(password);

      const user = await prisma.user.create({
        data: {
          name: name,
          email: normalizedEmail,
          password: hashPassword,
          role: role,
        },
        select: userSelect,
      });

      return user;
    } catch (error) {
      if ((error as Prisma.PrismaClientKnownRequestError).code === "P2002") {
        throw createError("Email já cadastrado.", 409);
      }
      throw error;
    }
  }

  async getAll({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}): Promise<UserListResponse> {
    const safePage = Math.max(1, Math.trunc(page));
    const take = Math.min(Math.max(1, Math.trunc(limit)), 100);
    const skip = (safePage - 1) * take;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: userSelect,
        orderBy: { name: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { data, meta: { total, page: safePage, limit: take, totalPages: Math.ceil(total / take) } };
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserResponse> {
    if (data.email) {
      data.email = data.email.toLowerCase().trim();
      data.verifiedEmail = false;
    }

    try {
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data,
        select: userSelect,
      });

      return updatedUser;
    } catch (error) {
      const code = (error as Prisma.PrismaClientKnownRequestError).code;
      if (code === "P2025") throw createError("Usuário não encontrado.", 404);
      if (code === "P2002") throw createError("Email já cadastrado.", 409);
      throw error;
    }
  }

  async updatePassword({
    id,
    currentPassword,
    newPassword,
  }: UpdateUserPasswordDTO & { id: string }): Promise<UserResponse> {
    const userPassword = await prisma.user.findUnique({
      where: { id: id },
      select: { password: true },
    });

    if (!userPassword) throw createError("Usuário não encontrado.", 404);

    const isMatch = await compareHashPassword(currentPassword, userPassword.password);
    if (!isMatch) throw createError("Senha inválida.", 401);

    const hashPassword = await generateHashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { password: hashPassword },
      select: userSelect,
    });

    return updatedUser;
  }

  async updateRole({ id, role }: UpdateUserRoleDTO & { id: string }): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { role: true },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (user.role === role) throw createError(`Usuário já é um ${role}.`, 409);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role },
      select: userSelect,
    });

    return updatedUser;
  }

  async toggle({ id, isActive }: ToggleUserDTO & { id: string }): Promise<UserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { isActive: true },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (user.isActive === isActive) throw createError(`Usuário já está ${isActive ? "ativado." : "desativado."}`, 409);

    const userToggle = await prisma.user.update({
      where: { id: id },
      data: { isActive: isActive },
      select: userSelect,
    });

    return userToggle;
  }
}

export default new UserService();