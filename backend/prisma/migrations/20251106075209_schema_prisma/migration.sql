/*
  Warnings:

  - You are about to drop the column `userId` on the `Module` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `Module` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Module" DROP CONSTRAINT "Module_userId_fkey";

-- AlterTable
ALTER TABLE "public"."File" ADD COLUMN     "embedding" BYTEA;

-- AlterTable
ALTER TABLE "public"."Module" DROP COLUMN "userId",
ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "public"."Collaboration" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "moduleId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'editor',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collaboration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collaboration_userId_moduleId_key" ON "public"."Collaboration"("userId", "moduleId");

-- AddForeignKey
ALTER TABLE "public"."Module" ADD CONSTRAINT "Module_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Collaboration" ADD CONSTRAINT "Collaboration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Collaboration" ADD CONSTRAINT "Collaboration_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "public"."Module"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
