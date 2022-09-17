import { BASE_EVENTS } from "./base";

export const ROOM_EVENTS = {
  WAIT: "wait",
  RECONNECTED: "reconnected",
  LEAVE: "leave",
  JOIN: "join",
  END_MATCH: "endMatch",
  ...BASE_EVENTS,
};
