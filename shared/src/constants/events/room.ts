import { BASE_EVENTS } from "./base";

export const ROOM_EVENTS = {
  RECONNECTED: "reconnected",
  LEAVE: "leave",
  JOIN: "join",
  PARTNER_LEAVE: "partnerLeave",
  PARTNER_DISCONNECT: "partnerDisconnect",
  ...BASE_EVENTS,
};
