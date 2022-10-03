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
  createRoom(userIds: number[]): Promise<string>;
}

export interface RoomManagementService extends RoomCreationService {
  joinRoom(
    userId: number,
    roomId: string,
  ): Promise<{ userId: number; isConnected: boolean }[]>;
  disconnectRoom(userId: number, roomId: string): Promise<void>;
  leaveRoom(userId: number, roomId: string): Promise<void>;
}
