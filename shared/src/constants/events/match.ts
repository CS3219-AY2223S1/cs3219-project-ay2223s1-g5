import { BASE_EVENTS } from "./base";

export const MATCH_EVENTS = {
  ENTER_QUEUE: "find",
  LEAVE_QUEUE: "leave",
  MATCH_FOUND: "found",
  EXISTING_MATCH: "existingMatch",
  END_MATCH: "endMatch",
  WAIT: "wait",
  ...BASE_EVENTS,
};
