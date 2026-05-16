import bcrypt from "bcrypt";
import { getRequiredEnv } from "./getRequiredEnv";

const SALT = parseInt(getRequiredEnv("SALT"));

export const generateHash = async (value: string): Promise<string> => {
  return await bcrypt.hash(value, SALT);
};
