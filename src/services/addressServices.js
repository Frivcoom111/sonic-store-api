import prisma from "../lib/prisma.js";
import { createError } from "../utils/createError.js";

class AddressService {
  async #findOwnedAddress(addressId, userId) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: {
        id: true,
        userId: true,
        street: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    if (!address) throw createError("Endereço não encontrado.", 404);
    if (address.userId !== userId) throw createError("Acesso negado.", 403);

    return address;
  }

  async getAddresses(userId) {
    return await prisma.address.findMany({
      where: { userId },
      select: {
        id: true,
        street: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });
  }

  async getAddressById(addressId, userId, role) {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: {
        id: true,
        userId: true,
        street: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });

    if (!address) throw createError("Endereço não encontrado.", 404);

    // Admin consegue acessar todos os endereços de todos os usuários, ao contrário o acesso é negado.
    if (role !== "ADMIN" && address.userId !== userId) throw createError("Acesso negado.", 403);

    return address;
  }

  async createAddress(userId, data) {
    return await prisma.address.create({
      data: { userId, ...data },
      select: {
        street: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });
  }

  async updateAddress(addressId, userId, data) {
    await this.#findOwnedAddress(addressId, userId);

    return await prisma.address.update({
      where: { id: addressId },
      data,
      select: {
        id: true,
        street: true,
        number: true,
        complement: true,
        city: true,
        state: true,
        zipCode: true,
      },
    });
  }

  async deleteAddress(addressId, userId) {
    await this.#findOwnedAddress(addressId, userId);

    await prisma.address.delete({ where: { id: addressId } });
  }
}

export default new AddressService();
