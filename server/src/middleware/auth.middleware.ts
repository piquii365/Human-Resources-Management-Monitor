import jwt from "jsonwebtoken";
import express from "express";

type Role = "user" | "admin" | "dev";

interface JwtPayload {
  sessionId: string;
  user: string;
  authAccount: number;
  role: Role;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Authentication middleware
export const authenticate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res
        .status(401)
        .json({ error: "You are not authorized to access this resource!" });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Authorization middleware
export const authorize = (roles: Role[]) => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
    next();
  };
};