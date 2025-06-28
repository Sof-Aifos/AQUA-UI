/*
  Warnings:

  - You are about to drop the column `is_model_answared` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "is_model_answared",
ADD COLUMN     "is_model_answer" BOOLEAN DEFAULT false;
