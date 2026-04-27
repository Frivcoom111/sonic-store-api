import prisma from "../lib/prisma.js";
import { createError } from "../utils/createError.js";

class ProductImagesService {
  async add(productId, url) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw createError("Produto não encontrado.", 404);

    return await prisma.productImage.create({
      data: { productId, url },
      select: { id: true, url: true, productId: true },
    });
  }

  async remove(productId, imageId) {
    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) throw createError("Imagem não encontrada.", 404);

    return await prisma.productImage.delete({
      where: { id: imageId },
      select: { id: true, url: true },
    });
  }

  async getByProduct(productId) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: { select: { id: true, url: true } } },
    });

    if (!product) throw createError("Produto não encontrado.", 404);

    return product;
  }
}

export default new ProductImagesService();
