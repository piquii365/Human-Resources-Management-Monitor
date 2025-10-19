import express from "express";
import { getReport } from "../controllers/reports.controller.js";

const router = express.Router();

// GET /api/reports/:reportName?format=pdf|csv|xlsx|json&months=12&limit=10&year=2025
router.get("/:reportName", getReport);

export default router;
