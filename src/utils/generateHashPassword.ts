import "dotenv/config";
import bcrypt from "bcrypt";
import { getRequiredEnv } from "./getRequiredEnv.js";

const SALT = parseInt(getRequiredEnv("SALT"));

export const generateHashPassword = async (password) => {
  return await bcrypt.hash(password, SALT);
};
