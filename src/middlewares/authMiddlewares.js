import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "../utils/getRequeridEnv.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");

export const authToken = async (req, res, next) => {
  try {
    const headerAuthorization = req.headers.authorization;

    // Verificação do token JWT.
    if (!headerAuthorization || !headerAuthorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const token = headerAuthorization.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }

    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};
