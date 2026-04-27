import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../utils/getRequeridEnv.js";
import { createError } from "../utils/createError.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken = (req, res, next) => {
  try {
    const headerAuthorization = req.headers.authorization;

    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return next(createError(401, "Token não fornecido."));
    }

    const token = headerAuthorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.isActive) return next(createError(401, "Usuário desativado, acesso negado."));

    req.user = decoded; // { id, role, isActive }

    next();
  } catch (error) {
    next(createError(401, "Token inválido ou expirado."));
  }
};

export const authAdminOnly = (req, res, next) => {
  const role = req.user?.role;

  if (!role || role !== "ADMIN") {
    return next(createError(403, "Acesso admin negado."));
  }

  next();
};
