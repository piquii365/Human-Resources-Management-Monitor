import express from "express";
import {
  listTrainingPrograms,
  getTraining,
  listEnrollments,
  createTraining,
  updateTraining,
  deleteTraining,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/training.controller.ts";

export default (router: express.Router): express.Router => {
  router.route("/training").get(listTrainingPrograms).post(createTraining);
  router
    .route("/training/:id")
    .get(getTraining)
    .put(updateTraining)
    .delete(deleteTraining);
  router
    .route("/training/:programId/enrollments")
    .get(listEnrollments)
    .post(createEnrollment);
  router
    .route("/enrollments/:id")
    .put(updateEnrollment)
    .delete(deleteEnrollment);
  return router;
};
