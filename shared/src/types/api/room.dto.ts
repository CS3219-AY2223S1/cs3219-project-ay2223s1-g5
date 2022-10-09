import { Language } from "../base";

export type JoinedPayload = {
  userId: number;
  metadata: {
    language: Language;
    members: { userId: number; isConnected: boolean }[];
    questionId: number;
  };
};

export type LeavePayload = {
  roomId: string;
};

export type JoinPayload = {
  roomId: string;
};

export type PartnerDisconnectPayload = {
  userId: number;
};

export type PartnerLeavePayload = {
  userId: number;
};

export type SubmitPayload = {
  code: string;
  questionId: number;
  language: Language;
};

export type SubmissionResultPayload = {
  success: boolean;
};
