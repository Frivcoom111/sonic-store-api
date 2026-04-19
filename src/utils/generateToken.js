import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "./getRequeridEnv.js";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = getRequiredEnv("JWT_EXPIRES_IN");

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role, isActive: user.isActive }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
