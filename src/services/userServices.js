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

  async update(id, body) {
    const allowedFields = ["name", "email"];

    const data = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

    if (data.email) data.email = data.email.toLowerCase().trim();

    if (Object.keys(data).length === 0) throw createError("Nenhum campo para atualizar.", 400);

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
