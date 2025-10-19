import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Evaluations from "../pages/Evaluations";
import Reports from "../pages/Reports";
import Recruitment from "../pages/Recruitment";
import Training from "../pages/Training";
import Departments from "../pages/Departments";
import Auth from "../pages/Auth";
import AdminUsers from "../pages/AdminUsers";
import RegistrationSuccess from "../pages/RegistrationSuccess";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import CalendarPage from "../pages/Calendar";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: "/admin/users", element: <AdminUsers /> },
      { path: "/auth/success", element: <RegistrationSuccess /> },
      { path: "/employees", element: <Employees /> },
      { path: "/evaluations", element: <Evaluations /> },
      { path: "/recruitment", element: <Recruitment /> },
      { path: "/departments", element: <Departments /> },
      { path: "/training", element: <Training /> },
      { path: "/reports", element: <Reports /> },
      { path: "/calendar", element: <CalendarPage /> },
    ],
  },
]);
