import { Outlet, RouteObject } from "react-router-dom";

import { SocketProvider } from "src/contexts/SocketContext";
import { LandingLayout } from "src/layouts/LandingLayout";
import { SidebarLayout } from "src/layouts/SidebarLayout";
import { LoginPage } from "src/pages/LoginPage";
import { QueuePage } from "src/pages/QueuePage";
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
              <SocketProvider>
                <QueuePage />
              </SocketProvider>
            ),
          },
          {
            path: "room/:roomId",
            element: (
              <SocketProvider>
                <RoomPage />
              </SocketProvider>
            ),
          },
        ],
      },
    ],
  },
];
