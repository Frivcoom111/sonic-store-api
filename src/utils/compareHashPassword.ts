import bcrypt from "bcrypt";

export const compareHashPassword = async (password, hashPassword) => {
  return await bcrypt.compare(password, hashPassword);
};
