import express from "express";
import authRoutes from "./auth.routes";
import departmentsRoutes from "./departments.routes";
import employeesRoutes from "./employees.routes";
import recruitmentRoutes from "./recruitment.routes";
import applicationsRoutes from "./applications.routes";
import trainingRoutes from "./training.routes";
import calendarRoutes from "./calendar.routes";

const router = express.Router();

export default (): express.Router => {
  authRoutes(router);
  departmentsRoutes(router);
  employeesRoutes(router);
  recruitmentRoutes(router);
  applicationsRoutes(router);
  trainingRoutes(router);
  calendarRoutes(router);
  return router;
};
