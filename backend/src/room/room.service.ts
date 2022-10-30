import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { nanoid } from "nanoid";
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

@Injectable()
export class RoomService
  implements RoomManagementService, RoomAuthorizationService
{
  private static readonly NAMESPACE = "Room";
  private static readonly PASSWORD_NAMESPACE = "PASSWORD";
  private static readonly LANGUAGE_NAMESPACE = "LANGUAGE";
  private static readonly QUESTION_NAMESPACE = "QUESTION";
  private static readonly MEMBERS_NAMESPACE = "MEMBERS";
  private static readonly REVERSE_MAPPING_NAMESPACE = "REVERSE";
  private static readonly DELIMITER = ":";
  private static readonly DISCONNECTED = "DISCONNECTED";

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
    const password = nanoid();

    const questionId = await this.questionService.getIdByDifficulty(difficulty);

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
      [RoomService.NAMESPACE, RoomService.PASSWORD_NAMESPACE],
      roomId,
      password,
    );
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

    for (const userId of userIds) {
      await this.redisService.addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${
          RoomService.DISCONNECTED
        }`,
      );

      await this.redisService.setKey(
        [RoomService.NAMESPACE, RoomService.REVERSE_MAPPING_NAMESPACE],
        userId.toString(),
        roomId,
      );
    }

    const document = this.questionService
      .getSolutionTemplateByLanguage(questionId, language)
      .then((template) => {
        if (!template) {
          this.logger.error(
            `Unable to load template: ${questionId} [${language}]`,
          );
          throw new InternalServerError();
        }
        return this.editorService.createDocument(roomId, template.code);
      });

    const chat = this.chatService.createChatRoom(roomId).then(() => {
      return Promise.all(
        userIds.map((userId) => {
          return this.chatService.joinChatRoom(roomId, userId);
        }),
      );
    });

    await Promise.all([chat, document]);

    return roomId;
  }

  async joinRoom(
    userId: number,
    socketId: string,
    roomId: string,
  ): Promise<{
    members: { userId: number; isConnected: boolean }[];
    password: string;
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
        `${userId.toString()}${RoomService.DELIMITER}${
          RoomService.DISCONNECTED
        }`,
      )
      .addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${socketId}`,
      )
      .execute();

    const members = await this.getMembers(roomId);

    const password = await this.redisService.getValue(
      [RoomService.NAMESPACE, RoomService.PASSWORD_NAMESPACE],
      roomId,
    );

    const languageString = await this.redisService.getValue(
      [RoomService.NAMESPACE, RoomService.LANGUAGE_NAMESPACE],
      roomId,
    );

    const language = Object.entries(Language).find(
      (value) => value[1] === languageString,
    )?.[1] as Language;

    const questionId = Number(
      await this.redisService.getValue(
        [RoomService.NAMESPACE, RoomService.QUESTION_NAMESPACE],
        roomId,
      ),
    );

    if (!members || !password || !language || isNaN(questionId)) {
      this.logger.error(
        `Unable to retrieve room metadata: ${roomId} [${members} | ${password} | ${language} | ${questionId}]`,
      );
      throw new InternalServerError();
    }

    return {
      members,
      password,
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
    const set = await this.redisService.getSet(
      [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
      roomId,
    );
    for (const record in set) {
      if (!record.startsWith(userId.toString())) {
        continue;
      }
      await this.redisService.deleteFromSet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        record,
      );
    }

    // We don't need to await this but we catch all errors and log them.
    this.chatService.leaveChatRoom(roomId, userId).catch((error) => {
      this.logger.warn(error);
    });

    if (
      !(await this.redisService.getSetSize(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
      ))
    ) {
      // We don't need to await this but we catch all errors and log them.
      this.terminateRoom(roomId).catch((error) => {
        this.logger.warn(error);
      });
    }
  }

  async disconnectRoom(
    userId: number,
    socketId: string,
    roomId: string,
  ): Promise<boolean> {
    await this.redisService
      .transaction()
      .addKeySet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${
          RoomService.DISCONNECTED
        }`,
      )
      .deleteFromSet(
        [RoomService.NAMESPACE, RoomService.MEMBERS_NAMESPACE],
        roomId,
        `${userId.toString()}${RoomService.DELIMITER}${socketId}`,
      )
      .execute();
    const members = await this.getMembers(roomId);
    console.log(members);
    return (
      members?.find((member) => member.userId === userId)?.isConnected || false
    );
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
    const map = new Map<number, boolean>();
    for (const member of members) {
      const userId = Number(member.split(RoomService.DELIMITER)[0]);
      const isConnected =
        map.get(userId) ||
        false ||
        member.split(RoomService.DELIMITER)[1] !== RoomService.DISCONNECTED;
      map.set(userId, isConnected);
    }
    return Array.from(map.entries()).map((entry) => ({
      userId: entry[0],
      isConnected: entry[1],
    }));
  }
}
