import { Difficulty, Language } from "~shared/types/base";

export const RoomServiceInterfaces = {
  RoomBasicService: "RoomBasicService",
  RoomCreationService: "RoomCreationService",
  RoomAuthorizationService: "RoomAuthorizationService",
  RoomManagementService: "RoomManagementService",
};

export interface RoomBasicService {
  getRoom(userId: number): Promise<string | null>;
}

export interface RoomAuthorizationService extends RoomBasicService {
  isAuthorized(roomId: string, userId: number): Promise<boolean>;
}

export interface RoomCreationService extends RoomBasicService {
  createRoom(
    language: Language,
    difficulty: Difficulty,
    userIds: number[],
  ): Promise<string>;
}

export interface RoomManagementService extends RoomCreationService {
  joinRoom(
    userId: number,
    socketId: string,
    roomId: string,
  ): Promise<{
    members: { userId: number; isConnected: boolean }[];
    password: string;
    language: Language;
    questionId: number;
  }>;
  disconnectRoom(
    userId: number,
    socketId: string,
    roomId: string,
  ): Promise<boolean>;
  leaveRoom(userId: number, roomId: string): Promise<void>;
}
