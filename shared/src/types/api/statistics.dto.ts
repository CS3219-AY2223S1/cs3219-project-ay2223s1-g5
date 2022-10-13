import { Difficulty } from "../base";

export type UserStatisticsRes = {
  attemptSummary: Record<Difficulty, number>;
  durationSummary: {
    difficulty: Difficulty;
    timetaken: number;
    date: Date;
  }[];
  peerSummary: {
    userName: string;
    questionTitle: string;
    date: Date;
  }[];
  heatmapData: {
    date: Date;
  }[];
  networkData: {
    topics: {
      id: number;
      name: string;
    }[];
    relations: {
      lowId: number;
      highId: number;
    }[];
  };
};
