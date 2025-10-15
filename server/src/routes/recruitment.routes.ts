import express from "express";
import {
  listRecruitments,
  getRecruitment,
  createRecruitment,
  updateRecruitment,
  deleteRecruitment,
} from "../controllers/recruitment.controller.ts";
import { validateRecruitment } from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/recruitment")
    .get(listRecruitments)
    .post(validateRecruitment, createRecruitment);
  router
    .route("/recruitment/:id")
    .get(getRecruitment)
    .put(validateRecruitment, updateRecruitment)
    .delete(deleteRecruitment);
  return router;
};
