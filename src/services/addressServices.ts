import prisma from "../lib/prisma.js";
import { createError } from "../utils/createError.js";
import type {
  AddressResponse,
  CreateAddressDTO,
  UpdateAddressDTO,
} from "../interfaces/address.interface.js";

const addressSelect = {
  id: true,
  userId: true,
  street: true,
  number: true,
  complement: true,
  city: true,
  state: true,
  zipCode: true,
} as const;

class AddressService {
  async #findOwnedAddress(addressId: string, userId: string): Promise<AddressResponse> {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: addressSelect,
    });

    if (!address) throw createError("Endereço não encontrado.", 404);
    if (address.userId !== userId) throw createError("Acesso negado.", 403);

    return address;
  }

  async getAddresses(userId: string): Promise<AddressResponse[]> {
    return await prisma.address.findMany({
      where: { userId },
      select: addressSelect,
    });
  }

  async getAddressById(addressId: string, userId: string, role: string): Promise<AddressResponse> {
    const address = await prisma.address.findUnique({
      where: { id: addressId },
      select: addressSelect,
    });

    if (!address) throw createError("Endereço não encontrado.", 404);

    if (role !== "ADMIN" && address.userId !== userId) throw createError("Acesso negado.", 403);

    return address;
  }

  async createAddress(userId: string, data: CreateAddressDTO): Promise<AddressResponse> {
    return await prisma.address.create({
      data: { userId, ...data },
      select: addressSelect,
    });
  }

  async updateAddress(addressId: string, userId: string, data: UpdateAddressDTO): Promise<AddressResponse> {
    await this.#findOwnedAddress(addressId, userId);

    return await prisma.address.update({
      where: { id: addressId },
      data,
      select: addressSelect,
    });
  }

  async deleteAddress(addressId: string, userId: string): Promise<void> {
    await this.#findOwnedAddress(addressId, userId);

    await prisma.address.delete({ where: { id: addressId } });
  }
}

export default new AddressService();
