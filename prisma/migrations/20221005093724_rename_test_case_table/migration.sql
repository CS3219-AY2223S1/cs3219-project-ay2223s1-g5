-- AlterTable
ALTER TABLE "TestCases" RENAME TO "TestCase";

-- AlterTable
ALTER TABLE "TestCase" RENAME CONSTRAINT "TestCases_questionId_fkey" TO "TestCase_questionId_fkey";

-- AlterTable
ALTER TABLE "TestCase" RENAME CONSTRAINT "TestCases_pkey" TO "TestCase_pkey";