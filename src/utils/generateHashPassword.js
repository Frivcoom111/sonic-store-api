import "dotenv/config";
import bcrypt from "bcrypt";
import { getRequiredEnv } from "./getRequeridEnv.js";

const SALT = getRequiredEnv("SALT");

export const generateHashPassword = async (password) => {
  // Peso da senha.
  const salt = await bcrypt.genSalt(SALT);
  const hashPassword = await bcrypt.hash(password, salt);

  return hashPassword;
};

