import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/core/prisma.service";

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSubmissionsByRoomId(roomId: string) {
    const roomSession = await this.prisma.roomSession.findUnique({
      where: { id: roomId },
      include: {
        submissions: true,
      },
    });

    return roomSession?.submissions;
  }
}
