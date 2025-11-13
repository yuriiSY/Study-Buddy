-- CreateEnum
CREATE TYPE "public"."Specialization" AS ENUM ('Math', 'Physics', 'Chemistry', 'Biology', 'ComputerScience');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "specialization" "public"."Specialization";
