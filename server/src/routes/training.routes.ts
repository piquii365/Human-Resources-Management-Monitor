import express from "express";
import {
  listTrainingPrograms,
  getTraining,
  listEnrollments,
} from "../controllers/training.controller.ts";

export default (router: express.Router): express.Router => {
  router.route("/training").get(listTrainingPrograms);
  router.route("/training/:id").get(getTraining);
  router.route("/training/:programId/enrollments").get(listEnrollments);
  return router;
};
