import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

import { ChatService } from "src/chat/chat.service";
import { ForbiddenError } from "src/common/errors/forbidden.error";
import { InternalServerError } from "src/common/errors/internal-server.error";
import { PrismaService } from "src/core/prisma.service";
import { EditorService } from "src/editor/editor.service";
import { QuestionService } from "src/question/question.service";
import { RedisService } from "src/redis/redis.service";

import {
  RoomAuthorizationService,
  RoomManagementService,
} from "./room.interface";

import { Difficulty, Language } from "~shared/types/base";

enum Status {
  CONNECTED = 1,
  DISCONNECTED = 0,
}

@Injectable()
export class RoomService
  implements RoomManagementService, RoomAuthorizationService
{
  private static readonly NAMESPACE = "Room";
  private static readonly LANGUAGE_NAMESPACE = "LANGUAGE";
  private static readonly QUESTION_NAMESPACE = "QUESTION";
  private static readonly MEMBERS_NAMESPACE = "MEMBERS";
  private static readonly REVERSE_MAPPING_NAMESPACE = "REVERSE";
  private static readonly DELIMITER = ":";

  constructor(
    @InjectPinoLogger(RoomService.name)
    private readonly logger: PinoLogger,
    private readonly redisService: RedisService,
    private readonly prismaService: PrismaService,
    private readonly questionService: QuestionService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @Inject(forwardRef(() => EditorService))
    private readonly editorService: EditorService,
  ) {}

  async createRoom(
    language: Language,
    difficulty: Difficulty,
    userIds: number[],
  ): Promise<string> {
    const questionId = await this.questionService.getIdByDifficulty(difficulty);
    const template = await this.questionService.getSolutionTemplateByLanguage(
      questionId,
      language,
    );

    if (!template) {
      this.logger.error(`Unable to load template: ${questionId} [${language}]`);
      throw new InternalServerError();
    }

    const room = await this.prismaService.roomSession.create({
      data: {
        startTime: new Date(),
        questionId,
        users: {
          connect: userIds.map((userId) => ({ id: userId })),
        },
      },
    });

    const roomId = room.id;

    await this.redisService.setKey(
      [RoomService.NAMESPACE, RoomService.LANGUAGE_NAMESPACE],
      roomId,
      language.toString(),
    );
    await this.redisService.setKey(
      [RoomService.NAMESPACE, RoomService.QUESTION_NAMESPACE],
      roomId,
      questionId.toString(),
    );

    await this.chatService.createChatRoom(roomId);

    for (const userId of userIds) {
      await this.redisService.addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${Status.DISCONNECTED}`,
      );

      await this.redisService.setKey(
        [RoomService.NAMESPACE, RoomService.REVERSE_MAPPING_NAMESPACE],
        userId.toString(),
        roomId,
      );

      await this.chatService.joinChatRoom(roomId, userId);
    }

    await this.editorService.createDocument(roomId, template.code);

    return roomId;
  }

  async joinRoom(
    userId: number,
    roomId: string,
  ): Promise<{
    members: { userId: number; isConnected: boolean }[];
    language: Language;
    questionId: number;
  }> {
    this.logger.info(`Joining room [${roomId}]: ${userId}`);
    if ((await this.getRoom(userId)) !== roomId) {
      this.logger.error(`Room mismatch [${roomId}]: ${userId}`);
      throw new ForbiddenError(`Incorrect room ID.`);
    }

    await this.redisService
      .transaction()
      .deleteFromSet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.DISCONNECTED}`,
      )
      .addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.CONNECTED}`,
      )
      .execute();

    const members = await this.getMembers(roomId);
    const languageString = await this.redisService.getValue(
      [RoomService.NAMESPACE, RoomService.LANGUAGE_NAMESPACE],
      roomId,
    );

    const language = Object.entries(Language).find(
      (value) => value[0] === languageString,
    )?.[1] as Language;

    const questionId = Number(
      await this.redisService.getValue(
        [RoomService.NAMESPACE, RoomService.QUESTION_NAMESPACE],
        roomId,
      ),
    );

    if (!members || !language || isNaN(questionId)) {
      this.logger.error(
        `Unable to retrieve room metadata: ${roomId} [${members} | ${language} | ${questionId}]`,
      );
      throw new InternalServerError();
    }

    return {
      members,
      language,
      questionId,
    };
  }

  async leaveRoom(userId: number, roomId: string): Promise<void> {
    this.logger.info(`Leaving room [${roomId}]: ${userId}`);
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE, RoomService.REVERSE_MAPPING_NAMESPACE],
      userId.toString(),
    );
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.CONNECTED}`,
    );
    // The user should be connected, but just in case we delete both entries.
    await this.redisService.deleteFromSet(
      [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
      roomId,
      `${userId.toString()}:${Status.DISCONNECTED}`,
    );

    await this.chatService.leaveChatRoom(roomId, userId);

    if (
      !(await this.redisService.getSetSize(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
      ))
    ) {
      await this.terminateRoom(roomId);
    }
  }

  async disconnectRoom(userId: number, roomId: string): Promise<void> {
    await this.redisService
      .transaction()
      .addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.DISCONNECTED}`,
      )
      .deleteFromSet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}:${Status.CONNECTED}`,
      )
      .execute();
  }

  async getRoom(userId: number): Promise<string | null> {
    return await this.redisService.getValue(
      [RoomService.NAMESPACE, RoomService.REVERSE_MAPPING_NAMESPACE],
      userId.toString(),
    );
  }

  async isAuthorized(roomId: string, userId: number): Promise<boolean> {
    const members = await this.getMembers(roomId);
    if (!members) {
      return false;
    }
    return !!members.filter((member) => member.userId === userId).length;
  }

  async terminateRoom(roomId: string): Promise<void> {
    this.logger.info(`Closing room: ${roomId}`);
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
      roomId,
    );
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE, RoomService.LANGUAGE_NAMESPACE],
      roomId,
    );
    await this.redisService.deleteKey(
      [RoomService.NAMESPACE, RoomService.QUESTION_NAMESPACE],
      roomId,
    );
    await this.prismaService.roomSession.update({
      where: { id: roomId },
      data: { endTime: new Date() },
    });
    // Document ID and room ID are the same.
    await this.editorService.removeDocument(roomId);
    await this.chatService.closeChatRoom(roomId);
  }

  private async getMembers(
    roomId: string,
  ): Promise<{ userId: number; isConnected: boolean }[] | null> {
    const members = await this.redisService.getSet(
      [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
      roomId,
    );
    if (members.length === 0) {
      return null;
    }
    return members.map((info) => ({
      userId: Number(info.split(RoomService.DELIMITER)[0]),
      isConnected: Boolean(Number(info.split(RoomService.DELIMITER)[1])),
    }));
  }
}
