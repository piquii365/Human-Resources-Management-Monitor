import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./config/Routes";

const App: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default App;
