import { Outlet, RouteObject } from "react-router-dom";

import { SocketProvider } from "src/contexts/WsContext";
import { DashboardPage } from "src/pages/DashboardPage";
import { LoginPage } from "src/pages/LoginPage";
import { ResetPasswordPage } from "src/pages/ResetPasswordPage";
import { WaitingPage } from "src/pages/WaitingPage";

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
          {
            path: "matching",
            element: (
              <SocketProvider>
                <WaitingPage />
              </SocketProvider>
            ),
          },
        ],
      },
    ],
  },
];
