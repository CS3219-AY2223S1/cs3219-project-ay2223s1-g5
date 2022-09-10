import { Outlet, RouteObject } from "react-router-dom";

import { SocketProvider } from "src/contexts/WsContext";
import { AccountSettingPage } from "src/pages/AccountSettingPage";
import { DashboardPage } from "src/pages/DashboardPage";
import { LoginPage } from "src/pages/LoginPage";
import { PeerPrepPage } from "src/pages/PeerPrepPage";
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
            path: "account",
            element: <AccountSettingPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "peerprep",
            element: <PeerPrepPage />,
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
