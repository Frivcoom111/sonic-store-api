import prisma from "../lib/prisma.js";
import { generateHashPassword } from "../utils/generateHashPassword.js";
import { compareHashPassword } from "../utils/compareHashPassword.js";

class UserService {
  async create({ name, email, password, role }) {
    try {
      // Normalizando email
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
      if (error.code === "P2002") {
        // Código Prisma pra unique constraint
        throw new Error("Email já cadastrado.");
      }

      throw error;
    }
  }

  async update(id, body) {
    const allowedFields = ["name", "email"];

    const data = Object.fromEntries(Object.entries(body).filter(([key]) => allowedFields.includes(key)));

    if (data.email) data.email = data.email.toLowerCase().trim();

    if (Object.keys(data).length === 0) throw new Error("Nenhum campo para atualizar.");

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data,
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async updatePassword({ id, currentPassword, newPassword }) {
    const userPassword = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        password: true,
      },
    });

    const isMatch = await compareHashPassword(currentPassword, userPassword.password);
    if (!isMatch) throw new Error("Senha inválida.");

    const hashPassword = await generateHashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        password: hashPassword,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async updateRole({ id, role }) {
    const userRole = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        role: true,
      },
    });

    // Validando role do usuário que veio do banco.
    if (userRole.role === role) throw new Error(`Usuário já é um ${role}`);

    const updatedUser = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        role: role,
      },
      select: {
        name: true,
        email: true,
        role: true,
      },
    });

    return updatedUser;
  }

  async toggle(id, isActive) {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      select: {
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!user) throw new Error("Usuário não existe.");
    if (user.isActive === isActive) throw new Error(`Usuário já está ${isActive ? "ativado." : "desativado."}`);

    const userToggle = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        isActive: isActive,
      },
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
