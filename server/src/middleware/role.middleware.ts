import express from "express";
import { getRole } from "../helpers/auth.helper";

export const ensureAdminOrHr = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const identifier = (req as any).user?.uid || (req as any).user?.email;
    if (!identifier)
      return res.status(401).json({ error: "Not authenticated" });
    const role = await getRole(identifier);
    (req as any).user = { ...(req as any).user, role };
    if (role === "admin" || role === "hr") return next();
    return res.status(403).json({ error: "Access denied" });
  } catch (err) {
    console.error("Role check failed", err);
    return res.status(500).json({ error: "Role check failed" });
  }
};

export const ensureAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const identifier = (req as any).user?.uid || (req as any).user?.email;
    if (!identifier)
      return res.status(401).json({ error: "Not authenticated" });
    const role = await getRole(identifier);
    (req as any).user = { ...(req as any).user, role };
    if (role === "admin") return next();
    return res.status(403).json({ error: "Admin only" });
  } catch (err) {
    console.error("Role check failed", err);
    return res.status(500).json({ error: "Role check failed" });
  }
};
