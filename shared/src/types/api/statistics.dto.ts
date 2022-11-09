import { Difficulty } from "../base";

export type UserStatisticsRes = {
  attemptSummary: Record<Difficulty, number>;
  durationSummary: {
    difficulty: Difficulty;
    timetaken: number;
    date: Date | string;
  }[];
  peerSummary: {
    userName: string;
    questionTitle: string;
    date: Date | string;
  }[];
  heatmapData: {
    date: Date | string;
  }[];
  networkData: {
    topics: {
      id: number;
      name: string;
      count: number;
    }[];
    links: {
      smallTopicId: number;
      largeTopicId: number;
    }[];
  };
};
