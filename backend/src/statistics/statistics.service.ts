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

    const existing = new Set<number>();

    for (const session of data) {
      // We only want to count unique questions.
      if (existing.has(session.questionId)) {
        continue;
      }
      existing.add(session.questionId);
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

    const existing = new Set<number>();
    const topics = new Map<number, string>();
    const links = new Map<number, Map<number, number>>();
    for (const session of data) {
      // We only want to count unique questions.
      if (existing.has(session.questionId)) {
        continue;
      }
      existing.add(session.questionId);
      const sortedTopics = session.question.topics.sort(
        (lhs, rhs) => lhs.id - rhs.id,
      );
      for (const topic of sortedTopics) {
        topics.set(topic.id, topic.name);
      }

      for (let low = 0; low < sortedTopics.length; low++) {
        for (let high = low + 1; high < sortedTopics.length; high++) {
          const currentMap = links.get(sortedTopics[low].id);
          const innerMap = currentMap || new Map<number, number>();
          innerMap.set(
            sortedTopics[high].id,
            (innerMap.get(sortedTopics[high].id) || 0) + 1,
          );
          if (!currentMap) {
            links.set(sortedTopics[low].id, innerMap);
          }
        }
      }
    }

    const topicSize = new Map<number, number>();
    for (const outerEntry of links) {
      const lowId = outerEntry[0];
      for (const innerEntry of outerEntry[1]) {
        const highId = innerEntry[0];
        topicSize.set(lowId, (topicSize.get(lowId) || 0) + 1);
        topicSize.set(highId, (topicSize.get(highId) || 0) + 1);
      }
    }

    return {
      topics: Array.from(topics.entries()).map((entry) => ({
        id: entry[0],
        name: entry[1],
        count: topicSize.get(entry[0]) || 0,
      })),
      links: Array.from(links.entries()).flatMap((edges) => {
        return Array.from(edges[1].keys()).map((edge) => {
          // In event of tie we set the larger ID to be the larger topic.
          if ((topicSize.get(edges[0]) || 0) < (topicSize.get(edge) || 0)) {
            return {
              smallTopicId: edges[0],
              largeTopicId: edge,
            };
          } else {
            return {
              smallTopicId: edge,
              largeTopicId: edges[0],
            };
          }
        });
      }),
    };
  }
}
