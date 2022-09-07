import { Outlet, RouteObject } from "react-router-dom";

import { DashboardPage } from "src/pages/DashboardPage";
import { Login } from "src/pages/Login";
import { PasswordReset } from "src/pages/PasswordReset";

import { ProtectedRoute } from "./ProtectedRoutes";

export const AppRoutes: RouteObject[] = [
  {
    children: [
      {
        path: "",
        element: <Login />,
      },
      {
        path: "resetpassword",
        element: <PasswordReset />,
      },
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },
];
