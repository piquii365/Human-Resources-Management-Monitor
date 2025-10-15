import express from "express";
import {
  listApplicationsForRecruitment,
  getApplication,
  createApplication,
  updateApplicationStatus,
} from "../controllers/applications.controller.ts";
import { validateApplication } from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/recruitment/:recruitmentId/applications")
    .get(listApplicationsForRecruitment)
    .post(validateApplication, createApplication);
  router
    .route("/applications/:id")
    .get(getApplication)
    .put(updateApplicationStatus);
  return router;
};
