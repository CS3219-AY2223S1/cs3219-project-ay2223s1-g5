export type JoinedPayload = {
  userId: number;
  members: { userId: number; isConnected: boolean }[];
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
