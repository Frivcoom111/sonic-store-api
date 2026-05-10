import type { NextFunction, Request, Response } from "express";
import authService from "../services/authServices";
import { loginSchema, registerSchema } from "../validators/authValidators";
import type {
  LoginDTO,
  LoginResponse,
  RegisterDTO,
} from "../interfaces/auth.interface";
import type { UserResponse } from "../interfaces/user.interface";

class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: RegisterDTO = validation.data;

      const userCreated: UserResponse = await authService.register(data);

      res.status(201).json({ message: "Usuário criado com sucesso.", userCreated });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({ error: validation.error.format() });
        return;
      }

      const data: LoginDTO = validation.data;

      const { token, user }: LoginResponse = await authService.login(data);

      res.status(200).json({ message: "Login feito com sucesso.", token, user });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.user?.id;
      if (!id) throw new Error("ID usuário inválido.");

      const user: UserResponse = await authService.getUser(id);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();