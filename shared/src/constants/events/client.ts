import { BASE_EVENTS } from "./base";

export const CLIENT_EVENTS = {
  CONNECT_ERROR: "connect_error",
  ERROR: "exception",
  ...BASE_EVENTS,
};
