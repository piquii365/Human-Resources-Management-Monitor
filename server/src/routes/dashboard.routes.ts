import express from "express";
import {
  getStats,
  getUpcomingEvents,
  getNotifications,
  getTasks,
  syncCalendar,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/stats", getStats);
router.get("/upcoming", getUpcomingEvents);
router.get("/notifications", getNotifications);
router.get("/tasks", getTasks);
router.post("/sync", syncCalendar);

export default router;
