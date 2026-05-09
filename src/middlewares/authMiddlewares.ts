import type { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../utils/getRequiredEnv.js";
import { createError } from "../utils/createError.js";
import prisma from "../lib/prisma.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const headerAuthorization = req.headers.authorization;

    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return next(createError("Token não fornecido.", 401));
    }

    const token = headerAuthorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { isActive: true, role: true },
    });

    if (!user || !user.isActive) return next(createError("Usuário desativado, acesso negado.", 401));

    req.user = { id: decoded.id, role: user.role, isActive: user.isActive };

    next();
  } catch (error) {
    next(createError("Token inválido ou expirado.", 401));
  }
};

export const authAdminOnly: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const role = req.user?.role;

  if (!role || role !== "ADMIN") {
    return next(createError("Acesso admin negado.", 403));
  }

  next();
};
