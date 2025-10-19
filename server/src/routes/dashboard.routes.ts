import express from "express";
import {
  getStats,
  getUpcomingEvents,
  getNotifications,
  getTasks,
  syncCalendar,
  appointHr,
} from "../controllers/dashboard.controller.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// require authenticated admin or hr for dashboard routes
router.use(authenticate, authorize(["admin", "hr"]));

router.get("/stats", getStats);
router.get("/upcoming", getUpcomingEvents);
router.get("/notifications", getNotifications);
router.get("/tasks", getTasks);
router.post("/sync", syncCalendar);

// admin-only endpoint to appoint a user as HR
router.post("/appoint-hr", authorize(["admin"]), appointHr);

export default router;
