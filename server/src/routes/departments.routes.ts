import express from "express";
import {
  listDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departments.controller.ts";
import { validateDepartment } from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/departments")
    .get(listDepartments)
    .post(validateDepartment, createDepartment);
  router
    .route("/departments/:id")
    .get(getDepartment)
    .put(validateDepartment, updateDepartment)
    .delete(deleteDepartment);
  return router;
};
