import "dotenv/config";
import jwt from "jsonwebtoken";
import { getRequiredEnv } from "./getRequiredEnv";

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = getRequiredEnv("JWT_EXPIRES_IN");

export const generateToken = (user: { id: string }) => {
  return jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};
