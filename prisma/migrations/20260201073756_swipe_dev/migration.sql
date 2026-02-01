/*
  Warnings:

  - A unique constraint covering the columns `[userId,roomId,restaurantId]` on the table `Swipe` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurantId` to the `Swipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Swipe_userId_roomId_key";

-- AlterTable
ALTER TABLE "Swipe" ADD COLUMN     "restaurantId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Swipe_userId_roomId_restaurantId_key" ON "Swipe"("userId", "roomId", "restaurantId");
