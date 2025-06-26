/*
  Warnings:

  - You are about to drop the column `name` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "order" BIGINT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "deletedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "name",
ADD COLUMN     "order" BIGINT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "message" DROP NOT NULL,
ALTER COLUMN "audio" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "verifiedAt" DROP NOT NULL;
