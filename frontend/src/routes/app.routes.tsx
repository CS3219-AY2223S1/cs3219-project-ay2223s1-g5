import { RouteObject } from "react-router-dom";

import { Login } from "src/pages/Login";
import { PasswordReset } from "src/pages/PasswordReset";

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
    ],
  },
];
