/*
  Warnings:

  - You are about to drop the column `direction` on the `Swipe` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Swipe` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RoomUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `choice` to the `Swipe` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_roomId_fkey";

-- DropForeignKey
ALTER TABLE "RoomUser" DROP CONSTRAINT "RoomUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Swipe" DROP CONSTRAINT "Swipe_restaurantId_fkey";

-- DropIndex
DROP INDEX "Swipe_userId_roomId_restaurantId_key";

-- AlterTable
ALTER TABLE "Swipe" DROP COLUMN "direction",
DROP COLUMN "restaurantId",
ADD COLUMN     "choice" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name";

-- DropTable
DROP TABLE "Restaurant";

-- DropTable
DROP TABLE "RoomUser";
