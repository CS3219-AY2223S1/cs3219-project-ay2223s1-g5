import { Outlet, RouteObject } from "react-router-dom";

import { SocketsProvider } from "src/contexts/SocketsContext";
import { LandingLayout } from "src/layouts/LandingLayout";
import { SidebarLayout } from "src/layouts/SidebarLayout";
import { LoginPage } from "src/pages/LoginPage";
import { QueuePage } from "src/pages/QueuePage";
import { RequestVerificationEmailPage } from "src/pages/RequestVerificationEmailPage";
import { ResetPasswordPage } from "src/pages/ResetPasswordPage";
import { RoomPage } from "src/pages/RoomPage";
import { VerificationPage } from "src/pages/VerificationPage";

import { NavigationBarRoutes } from "./nav.routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { PublicRoute } from "./PublicRoute";

export const AppRoutes: RouteObject[] = [
  {
    children: [
      {
        path: "",
        element: (
          <PublicRoute>
            <LandingLayout />
          </PublicRoute>
        ),
        children: [
          {
            path: "",
            element: <LoginPage />,
          },
          {
            path: "reset-password",
            element: <ResetPasswordPage />,
          },
          {
            path: "request-verify",
            element: <RequestVerificationEmailPage />,
          },
        ],
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
            path: "queue",
            element: (
              <SocketsProvider>
                <QueuePage />
              </SocketsProvider>
            ),
          },
          {
            path: "room/:roomId",
            element: (
              <SocketsProvider>
                <RoomPage />
              </SocketsProvider>
            ),
          },
        ],
      },
    ],
  },
];
