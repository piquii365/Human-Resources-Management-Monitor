import express from "express";
import authRoutes from "./auth.routes";
import departmentsRoutes from "./departments.routes";
import employeesRoutes from "./employees.routes";
import recruitmentRoutes from "./recruitment.routes";
import applicationsRoutes from "./applications.routes";
import trainingRoutes from "./training.routes";
import evaluationsRoutes from "./evaluations.routes";
import calendarRoutes from "./calendar.routes";
import reportsRoutes from "./reports.routes";
import dashboardRoutes from "./dashboard.routes";

const router = express.Router();

export default (): express.Router => {
  authRoutes(router);
  departmentsRoutes(router);
  employeesRoutes(router);
  recruitmentRoutes(router);
  applicationsRoutes(router);
  trainingRoutes(router);
  evaluationsRoutes(router);
  calendarRoutes(router);
  // reports
  router.use("/reports", reportsRoutes);
  // dashboard
  router.use("/dashboard", dashboardRoutes);
  return router;
};
