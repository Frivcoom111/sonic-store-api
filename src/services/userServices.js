import prisma from "../lib/prisma.js";
import { generateHashPassword } from "../utils/generateHashPassword.js";
import { compareHashPassword } from "../utils/compareHashPassword.js";
import { createError } from "../utils/createError.js";

class UserService {
  async create({ name, email, password, role }) {
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

  async getAll({ page = 1, limit = 20 } = {}) {
    const take = Math.min(limit, 100);
    const skip = (page - 1) * take;

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.user.count(),
    ]);

    return { data, meta: { total, page, limit: take, totalPages: Math.ceil(total / take) } };
  }

  async update(id, data) {
    if (data.email) data.email = data.email.toLowerCase().trim();

    try {
      const updatedUser = await prisma.user.update({
        where: { id: id },
        data,
        select: {
          name: true,
          email: true,
          role: true,
        },
      });

      return updatedUser;
    } catch (error) {
      if (error.code === "P2025") throw createError("Usuário não encontrado.", 404);
      if (error.code === "P2002") throw createError("Email já cadastrado.", 409);
      throw error;
    }
  }

  async updatePassword({ id, currentPassword, newPassword }) {
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
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async updateRole({ id, role }) {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: { role: true },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (user.role === role) throw createError(`Usuário já é um ${role}.`, 409);

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: { role: role },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async toggle({ id, isActive }) {
    const user = await prisma.user.findUnique({
      where: { id: id },
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw createError("Usuário não encontrado.", 404);
    if (user.isActive === isActive) throw createError(`Usuário já está ${isActive ? "ativado." : "desativado."}`, 409);

    const userToggle = await prisma.user.update({
      where: { id: id },
      data: { isActive: isActive },
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return userToggle;
  }
}

export default new UserService();