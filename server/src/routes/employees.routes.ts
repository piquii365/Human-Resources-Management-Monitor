import express from "express";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../controllers/employees.controller.ts";
import { validateEmployee } from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/employees")
    .get(listEmployees)
    .post(validateEmployee, createEmployee);
  router
    .route("/employees/:id")
    .get(getEmployee)
    .put(validateEmployee, updateEmployee)
    .delete(deleteEmployee);
  return router;
};
