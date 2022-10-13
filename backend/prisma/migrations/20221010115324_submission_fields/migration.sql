/*
  Warnings:

  - Added the required column `expectedOutput` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Status" ADD VALUE 'RUNTIME_ERROR';
ALTER TYPE "Status" ADD VALUE 'INTERNAL_ERROR';

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "compileOutput" TEXT,
ADD COLUMN     "errorOutput" TEXT,
ADD COLUMN     "exitCode" INTEGER,
ADD COLUMN     "expectedOutput" TEXT NOT NULL;
