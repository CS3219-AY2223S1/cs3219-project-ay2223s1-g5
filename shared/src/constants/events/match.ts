import { BASE_EVENTS } from "./base";

export const MATCH_EVENTS = {
  ENTER_QUEUE: "find",
  LEAVE_QUEUE: "leave",
  MATCH_FOUND: "found",
  ...BASE_EVENTS,
};
