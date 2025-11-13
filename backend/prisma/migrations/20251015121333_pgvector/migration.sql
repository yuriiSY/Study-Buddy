/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
-- ADD COLUMN     "password" TEXT NOT NULL;

-- -- CreateTable
-- CREATE TABLE "Document" (
--     "id" SERIAL NOT NULL,
--     "name" TEXT NOT NULL,
--     "embedding" BYTEA NOT NULL,

--     CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
-- );
