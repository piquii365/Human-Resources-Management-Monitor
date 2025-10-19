import express from "express";
import admin from "../config/firebase.config";
import { getRole } from "../helpers/auth.helper";

type Role = "employee" | "admin" | "hr";
interface JwtPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: Role;
  [key: string]: any; // for any additional properties
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Authentication middleware
export const authenticate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      res
        .status(401)
        .json({ error: "You are not authorized to access this resource!" });
      return;
    }
    const decoded = (await admin.auth().verifyIdToken(token)) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const authorize = (roles: Role[]) => {
  return async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): Promise<void> => {
    const identifier = req.user?.uid || req.user?.email;
    if (!identifier) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    try {
      const userRole = (await getRole(identifier)) as Role | undefined | null;
      if (!userRole || !roles.includes(userRole as Role)) {
        res.status(403).json({ error: "Access denied" });
        return;
      }
      next();
    } catch (err) {
      res.status(500).json({ error: "Failed to determine user role" });
    }
  };
};
