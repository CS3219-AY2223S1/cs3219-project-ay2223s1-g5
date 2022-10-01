import { Injectable } from "@nestjs/common";

import { PrismaService } from "src/core/prisma.service";

@Injectable()
export class QuestionService {
  constructor(private prisma: PrismaService) {}
}
