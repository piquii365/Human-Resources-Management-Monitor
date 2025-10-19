import express from "express";
import * as controller from "../controllers/evaluations.controller.js";

export default (router: express.Router) => {
  router.get("/evaluations", controller.listEvaluations);
  router.get("/evaluations/:id", controller.getEvaluationById);
  router.get(
    "/employees/:employee_id/evaluations",
    controller.getEvaluationsByEmployee
  );
  router.post("/evaluations", controller.createEvaluation);
  router.put("/evaluations/:id", controller.updateEvaluation);
  router.delete("/evaluations/:id", controller.deleteEvaluation);
};
