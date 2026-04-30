import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../utils/getRequeridEnv.js";
import { createError } from "../utils/createError.js";
import prisma from "../lib/prisma.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken = async (req, res, next) => {
  try {
    const headerAuthorization = req.headers.authorization;

    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return next(createError("Token não fornecido.", 401));
    }

    const token = headerAuthorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { isActive: true } });

    if (!user || !user.isActive) return next(createError("Usuário desativado, acesso negado.", 401));

    req.user = decoded; // { id, role, isActive }

    next();
  } catch (error) {
    next(createError("Token inválido ou expirado.", 401));
  }
};

export const authAdminOnly = (req, res, next) => {
  const role = req.user?.role;

  if (!role || role !== "ADMIN") {
    return next(createError("Acesso admin negado.", 403));
  }

  next();
};
