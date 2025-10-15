import express from "express";
import { getCalendarEvents } from "../controllers/calendar.controller.ts";

export default (router: express.Router): express.Router => {
  router.route("/calendar/events").get(getCalendarEvents);
  return router;
};
