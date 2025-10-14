import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Evaluations from "../pages/Evaluations";
import Reports from "../pages/Reports";
import Recruitment from "../pages/Recruitment";
import Training from "../pages/Training";
import Auth from "../pages/Auth";
import Layout from "../components/layout/Layout";
import ProtectedRoute from "../components/ProtectedRoute";

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
      { path: "/employees", element: <Employees /> },
      { path: "/evaluations", element: <Evaluations /> },
      { path: "/recruitment", element: <Recruitment /> },
      { path: "/training", element: <Training /> },
      { path: "/reports", element: <Reports /> },
    ],
  },
]);
