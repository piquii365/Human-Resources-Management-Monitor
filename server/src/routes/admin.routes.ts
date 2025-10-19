import express from "express";
import { listUsers, appointHr } from "../controllers/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { ensureAdmin } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/users", authenticate, ensureAdmin, listUsers);
router.post("/appoint-hr", authenticate, ensureAdmin, appointHr);

export default router;
