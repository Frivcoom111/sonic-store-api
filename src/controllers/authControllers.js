import authService from "../services/authService.js";
import { loginSchema, registerSchema } from "../validators/authValidators.js";

class AuthController {
  async register(req, res, next) {
    try {
      // Validação dos dados no Zod.
      const validation = registerSchema.safeParse(req.body);

      // Lançamento dos erros do zod.
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { name, email, password } = validation.data;

      const userCreated = await authService.register({
        name,
        email,
        password,
      });

      res.status(201).json({ message: "Usuário criado com sucesso.", userCreated });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      // Validação dos dados no Zod.
      const validation = loginSchema.safeParse(req.body);

      // Lançamento dos erros do zod.
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.format() });
      }

      const { email, password } = validation.data;

      const user = await authService.login({
        email,
        password,
      });

      res.status(200).json({
        message: "Login feito com sucesso.",
        token: user.token,
        user: user.user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const id = req.user.id;
      if (!id) throw new Error("ID usuário inválido.");

      const user = await authService.getUser(id);

      res.status(200).json({ user });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
