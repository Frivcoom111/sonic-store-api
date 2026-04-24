import userService from "../services/userServices.js";
import { idParamsSchema } from "../validators/globalValidators.js";
import {
  userCreateSchema,
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
      const { id } = req.params;

      const validationId = idParamsSchema.safeParse({ id });
      const validation = userUpdateRoleSchema.safeParse(req.body);


      if (!validationId.success) {
        return res.status(400).json({ error: validationId.error.format() });
      }
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { role } = validation.data;

      const updatedUser = await userService.updateRole({ id: validationId.data.id, role });

      res.status(200).json({ message: "Papel atualizado com sucesso.", updatedUser });
    } catch (error) {
      next(error);
    }
  }

  async toggle(req, res, next) {
    try {
      const { id } = req.params;

      const validation = idParamsSchema.safeParse({ id });

      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({ message: "isActive deve ser um boolean." });
      }

      const userToggle = await userService.toggle({ id: validation.data.id, isActive });

      res.status(200).json({ message: "Usuário ativado com sucesso.", userToggle });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
