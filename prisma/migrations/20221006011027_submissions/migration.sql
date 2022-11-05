-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'ACCEPTED', 'WRONG_ANSWER', 'COMPILE_ERROR', 'TIME_LIMIT_EXCEEDED');

-- CreateTable
CREATE TABLE "RoomSession" (
    "id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "RoomSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "roomSessionId" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',
    "language" "Language" NOT NULL,
    "output" TEXT,
    "code" TEXT NOT NULL,
    "runTime" INTEGER,
    "memoryUsage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RoomSessionToUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomSessionToUser_AB_unique" ON "_RoomSessionToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomSessionToUser_B_index" ON "_RoomSessionToUser"("B");

-- AddForeignKey
ALTER TABLE "RoomSession" ADD CONSTRAINT "RoomSession_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_roomSessionId_fkey" FOREIGN KEY ("roomSessionId") REFERENCES "RoomSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomSessionToUser" ADD CONSTRAINT "_RoomSessionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomSessionToUser" ADD CONSTRAINT "_RoomSessionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
