import "dotenv/config";
import jwt from "jsonwebtoken";

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or empty required environment variable: ${name}`);
  }

  return value;
};

const JWT_SECRET = getRequiredEnv("JWT_SECRET");
const JWT_EXPIRES_IN = getRequiredEnv("JWT_EXPIRES_IN");

export const generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
