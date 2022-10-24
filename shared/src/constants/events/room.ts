import { BASE_EVENTS } from "./base";

export const ROOM_EVENTS = {
  JOINED: "reconnected",
  LEAVE: "leave",
  JOIN: "join",
  PARTNER_LEAVE: "partnerLeave",
  PARTNER_DISCONNECT: "partnerDisconnect",
  SUBMIT: "submit",
  SUBMISSION_ACCEPTED: "accepted",
  SUBMISSION_REJECTED: "reject",
  SUBMISSION_UPDATED: "submissionUpdate",
  ...BASE_EVENTS,
};
