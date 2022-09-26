import { BASE_EVENTS } from "./base";

export const QUEUE_EVENTS = {
  ENTER_QUEUE: "find",
  MATCH_FOUND: "found",
  EXISTING_MATCH: "existingMatch",
  ...BASE_EVENTS,
};