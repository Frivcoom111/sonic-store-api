import userService from "../services/userService.js";
import {
  userCreateSchema,
  userParamsSchema,
  userUpdatePasswordSchema,
  userUpdateRoleSchema,
  userUpdateSchema,
} from "../validators/userValidators.js";

class UserController {
  async createUser(req, res, next) {
    try {
      // Validação com o zod.
      const validation = userCreateSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { name, email, password, role } = validation.data;

      const userCreated = await userService.create({
        name,
        email,
        password,
        role,
      });

      res.status(201).json({ message: "Usuário criado com sucesso.", userCreated });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const validation = userUpdateSchema.safeParse(req.body);
      const id = req.user.id;

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const updatedUser = await userService.update(id, validation.data);

      res.status(200).json({ message: "Usuário atualizado com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async updateUserPassword(req, res, next) {
    try {
      const validation = userUpdatePasswordSchema.safeParse(req.body);
      const id = req.user.id;

      if (!validation.success) return res.status(400).json({ error: validation.error.format() });

      const { currentPassword, newPassword } = validation.data;

      const updatedUser = await userService.updatePassword({ id, currentPassword, newPassword });

      res.status(200).json({ message: "Senha atualizada com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req, res, next) {
    try {
      const validation = userUpdateRoleSchema.safeParse(req.body);

      let { id } = req.params;

      const validationId = userParamsSchema.safeParse({ id });

      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { role } = validation.data;
      id = validationId.data.id;

      const updatedUser = await userService.updateRole({ id, role });

      res.status(200).json({ message: "Papel atualizado com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req, res, next) {
    try {
      let { id } = req.params;

      const validation = userParamsSchema.safeParse({ id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive deve ser um boolean." });
      }

      const { isActive } = req.body;
      id = validation.data.id;

      const userToggle = await userService.toggle(id, isActive);

      res.status(200).json({ message: "Usuário ativado com sucesso.", userToggle });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
