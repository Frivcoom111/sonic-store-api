import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../utils/getRequeridEnv.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken = (req, res, next) => {
  try {
    const headerAuthorization = req.headers.authorization;

    // Verificação do token JWT.
    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = headerAuthorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    // Verifica se o usuário está desativado.
    if (!decoded.isActive) return res.status(401).json({ message: "Usuário desativado, acesso negado." });

    req.user = decoded; // { id, role, isActive }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

export const authAdminOnly = (req, res, next) => {
  try {
    const role = req.user.role;

    if (!role || role !== "ADMIN") {
      return res.status(403).json({ message: "Acesso admin negado." });
    }

    next();
  } catch (error) {
    res.status(403).json({ message: "Acesso admin negado." });
  }
};
