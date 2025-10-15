import { register } from "../controllers/auth.controller.ts";
import express from "express";
import { authLimiter } from "../middleware/limit.middleware.ts";
import { validateRegistration } from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/auth/register")
    .post(authLimiter, validateRegistration, register);
  return router;
};
