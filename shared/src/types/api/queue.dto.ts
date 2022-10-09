import { IsDifficulty } from "../../decorators/is-difficulty.decorator";
import { IsLanguage } from "../../decorators/is-language.decorator";
import { Difficulty, Language } from "../base";

export class EnterQueuePayload {
  @IsDifficulty()
  difficulty: Difficulty;

  @IsLanguage()
  language: Language;
}

export type FoundRoomPayload = {
  roomId: string;
  result: { userId: number; socketId: string }[];
};
