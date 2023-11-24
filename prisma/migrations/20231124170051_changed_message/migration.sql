/*
  Warnings:

  - You are about to drop the column `to` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `from` on the `Message` table. All the data in the column will be lost.
  - Added the required column `from` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_to_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_from_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "to",
DROP COLUMN "from",
ADD COLUMN     "from" UUID NOT NULL,
ADD COLUMN     "to" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_from_fkey" FOREIGN KEY ("from") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_to_fkey" FOREIGN KEY ("to") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
