import { Injectable } from "@nestjs/common";
import { differenceInSeconds, subDays, subYears } from "date-fns";

import { PrismaService } from "src/core/prisma.service";

import { UserStatisticsRes } from "~shared/types/api";
import { Difficulty } from "~shared/types/base";

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getByUserId(userId: number): Promise<UserStatisticsRes> {
    const attemptSummaryPromise = this.getAttemptSummaryByUserId(userId);
    const durationSummaryPromise = this.getDurationSummaryByUserId(userId);
    const peerSummaryPromise = this.getPeerSummaryByUserId(userId);
    const heatmapDataPromise = this.getHeatmapDataByUserId(userId);
    const networkDataPromise = this.getNetworkDataByUserId(userId);

    const attemptSummary = await attemptSummaryPromise;
    const durationSummary = await durationSummaryPromise;
    const peerSummary = await peerSummaryPromise;
    const heatmapData = await heatmapDataPromise;
    const networkData = await networkDataPromise;

    return {
      attemptSummary,
      durationSummary,
      peerSummary,
      heatmapData,
      networkData,
    };
  }

  private async getAttemptSummaryByUserId(userId: number) {
    const data = await this.prisma.roomSession.findMany({
      where: { users: { some: { id: userId } }, endTime: { not: null } },
      include: {
        question: {
          select: { difficulty: true },
        },
      },
    });
    const map = {
      [Difficulty.EASY]: 0,
      [Difficulty.MEDIUM]: 0,
      [Difficulty.HARD]: 0,
    };
    for (const session of data) {
      const { difficulty } = session.question;
      map[difficulty] = map[difficulty] + 1;
    }
    return map;
  }

  private async getDurationSummaryByUserId(userId: number) {
    const data = await this.prisma.roomSession.findMany({
      where: {
        users: { some: { id: userId } },
        endTime: { not: null },
        startTime: {
          gte: subDays(new Date(), 30),
        },
      },
      include: {
        question: {
          select: { difficulty: true },
        },
      },
    });
    return data
      .filter((session) => !!session.endTime)
      .map((session) => {
        return {
          difficulty: session.question.difficulty as Difficulty,
          timetaken: differenceInSeconds(
            session.endTime || new Date(), // Should be defined by selection.
            session.startTime,
          ),
          date: session.startTime,
        };
      });
  }

  private async getPeerSummaryByUserId(userId: number) {
    const data = await this.prisma.roomSession.findMany({
      where: { users: { some: { id: userId } }, endTime: { not: null } },
      include: {
        question: {
          select: { title: true },
        },
        users: true,
      },
    });
    return data.map((session) => {
      return {
        userName: session.users.find((user) => user.id !== userId)?.name || "",
        questionTitle: session.question.title,
        date: session.startTime,
      };
    });
  }

  private async getHeatmapDataByUserId(userId: number) {
    const data = await this.prisma.roomSession.findMany({
      where: {
        users: { some: { id: userId } },
        endTime: { not: null },
        startTime: {
          gte: subYears(new Date(), 1),
        },
      },
    });
    return data.map((session) => {
      return { date: session.startTime };
    });
  }

  private async getNetworkDataByUserId(userId: number) {
    const data = await this.prisma.roomSession.findMany({
      where: {
        users: { some: { id: userId } },
        endTime: { not: null },
      },
      include: {
        question: {
          include: {
            topics: true,
          },
        },
      },
    });
    const topics = new Map<number, string>();
    const relations = new Map<number, number>();
    for (const session of data) {
      const sortedTopics = session.question.topics.sort((l, r) => l.id - r.id);
      for (const topic of sortedTopics) {
        topics.set(topic.id, topic.name);
      }

      for (let idx = 0; idx < sortedTopics.length; idx++) {
        for (let oth = idx + 1; oth < sortedTopics.length; oth++) {
          relations.set(sortedTopics[idx].id, sortedTopics[oth].id);
        }
      }
    }
    return {
      topics: Array.from(topics.entries()).map((entry) => ({
        id: entry[0],
        name: entry[1],
      })),
      relations: Array.from(relations.entries()).map((relation) => ({
        lowId: relation[0],
        highId: relation[1],
      })),
    };
  }
}
