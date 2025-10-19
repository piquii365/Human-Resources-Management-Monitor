import express from "express";
import {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesMinDetails,
} from "../controllers/employees.controller.ts";
import {
  validateEmployee,
  handleValidationErrors,
} from "../middleware/validation.middleware.ts";

export default (router: express.Router): express.Router => {
  router
    .route("/employees")
    .get(listEmployees)
    .post(validateEmployee, handleValidationErrors, createEmployee);
  router.route("/min-employees").get(getEmployeesMinDetails);
  router
    .route("/employees/:id")
    .get(getEmployee)
    .put(validateEmployee, handleValidationErrors, updateEmployee)
    .delete(deleteEmployee);
  return router;
};
