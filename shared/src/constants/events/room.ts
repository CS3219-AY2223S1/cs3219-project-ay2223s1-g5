import { BASE_EVENTS } from "./base";

export const ROOM_EVENTS = {
  JOINED: "reconnected",
  LEAVE: "leave",
  JOIN: "join",
  PARTNER_LEAVE: "partnerLeave",
  PARTNER_DISCONNECT: "partnerDisconnect",
  SUBMIT: "submit",
  SUBMISSION_RESULT: "result",
  SUBMISSION_REJECTED: "reject",
  ...BASE_EVENTS,
};
