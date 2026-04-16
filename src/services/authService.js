import prisma from "../lib/prisma.js";

class AuthService {
  async register(name, email, password, role) {
    const user = await prisma.user.create({
      name: name,
      email: email,
      password: password,
      role: role,
    });

    return user;
  }
}

export default new AuthService();