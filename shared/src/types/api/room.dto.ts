import { IsNumber } from "class-validator";

import { IsLanguage } from "../../decorators/is-language.decorator";
import { IsNonEmptyString } from "../../decorators/is-non-empty-string.decorator";
import { Language } from "../base";

export class LeavePayload {
  @IsNonEmptyString()
  roomId: string;
}

export class JoinPayload {
  @IsNonEmptyString()
  roomId: string;
}

export class SubmitPayload {
  @IsNonEmptyString()
  code: string;

  @IsNumber()
  questionId: number;

  @IsLanguage()
  language: Language;
}

export type JoinedPayload = {
  userId: number;
  metadata: {
    language: Language;
    members: { userId: number; isConnected: boolean }[];
    questionId: number;
  };
};

export type PartnerDisconnectPayload = {
  userId: number;
};

export type PartnerLeavePayload = {
  userId: number;
};

export type SubmissionRejectedPayload = {
  reason: string;
};

export type SubmissionUpdatedPayload = {
  submissionId: string;
};
