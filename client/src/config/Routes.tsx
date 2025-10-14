import { createBrowserRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Evaluations from "../pages/Evaluations";
import Reports from "../pages/Reports";
import Recruitment from "../pages/Recruitment";
import Training from "../pages/Training";
import Layout from "../components/layout/Layout";

/**
 * 
 * <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/recruitment" element={<Recruitment />} />
          <Route path="/training" element={<Training />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </Layout>
 */

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
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
