/*
  Warnings:

  - You are about to alter the column `state` on the `Address` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(2)`.
  - A unique constraint covering the columns `[cartId,productId]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `zipCode` to the `Address` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "zipCode" VARCHAR(9) NOT NULL,
ALTER COLUMN "state" SET DATA TYPE VARCHAR(2);

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_key" ON "CartItem"("cartId", "productId");
