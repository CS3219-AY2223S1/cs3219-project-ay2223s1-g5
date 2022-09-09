import { Outlet, RouteObject } from "react-router-dom";

import { DashboardPage } from "src/pages/DashboardPage";
import { LoginPage } from "src/pages/LoginPage";
import { ResetPasswordPage } from "src/pages/ResetPasswordPage";

import { ProtectedRoute } from "./ProtectedRoutes";

export const AppRoutes: RouteObject[] = [
  {
    children: [
      {
        path: "",
        element: <LoginPage />,
      },
      {
        path: "resetpassword",
        element: <ResetPasswordPage />,
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
