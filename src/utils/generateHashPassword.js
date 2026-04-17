import bcrypt from "bcrypt";

export const generateHashPassword = async (password) => {
    // Peso da senha.
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    return hashPassword;
}