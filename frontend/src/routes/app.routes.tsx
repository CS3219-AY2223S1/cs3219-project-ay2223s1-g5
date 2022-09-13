import { Outlet, RouteObject } from "react-router-dom";

import { SocketProvider } from "src/contexts/WsContext";
import { SidebarLayout } from "src/layouts/SidebarLayout";
import { LoginPage } from "src/pages/LoginPage";
import { ResetPasswordPage } from "src/pages/ResetPasswordPage";
import { VerificationPage } from "src/pages/VerificationPage";
import { WaitingPage } from "src/pages/WaitingPage";

import { NavigationBarRoutes } from "./nav.routes";
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
        path: "verify",
        element: <VerificationPage />,
      },
      {
        element: (
          <ProtectedRoute>
            <Outlet />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "",
            element: <SidebarLayout />,
            children: NavigationBarRoutes,
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
