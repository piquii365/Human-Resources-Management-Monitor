import express from "express";
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../controllers/calendar.controller.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/calendar/events")
    .get(getCalendarEvents)
    .post(createCalendarEvent);
  router
    .route("/calendar/events/:id")
    .put(updateCalendarEvent)
    .delete(deleteCalendarEvent);
  return router;
};
