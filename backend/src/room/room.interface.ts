import { Language } from "~shared/types/base";

export const RoomServiceInterfaces = {
  RoomBasicService: "RoomBasicService",
  RoomCreationService: "RoomCreationService",
  RoomAuthorizationService: "RoomAuthorizationService",
  RoomManagementService: "RoomManagementService",
};

export interface RoomBasicService {
  getRoom(userId: number): Promise<string | null>;
}

export interface RoomAuthorizationService {
  isAuthorized(roomId: string, userId: number): Promise<boolean>;
}

export interface RoomCreationService extends RoomBasicService {
  createRoom(language: Language, userIds: number[]): Promise<string>;
}

export interface RoomManagementService extends RoomCreationService {
  joinRoom(
    userId: number,
    roomId: string,
  ): Promise<{
    members: { userId: number; isConnected: boolean }[];
    language: Language;
  }>;
  disconnectRoom(userId: number, roomId: string): Promise<void>;
  leaveRoom(userId: number, roomId: string): Promise<void>;
}