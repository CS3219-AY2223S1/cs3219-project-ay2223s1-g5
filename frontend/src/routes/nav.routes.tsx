import { RouteObject } from "react-router-dom";
import {
  AccountCircleOutlined,
  LaptopOutlined,
  SvgIconComponent,
  WebOutlined,
} from "@mui/icons-material";

import { AccountSettingPage } from "src/pages/AccountSettingPage";
import { DashboardPage } from "src/pages/DashboardPage";
import { DifficultySelectionPage } from "src/pages/DifficultySelectionPage";

type NavigationRouteObject = RouteObject & {
  Icon: SvgIconComponent;
  label: string;
  path: string;
  children?: NavigationRouteObject[];
};

export const NavigationBarRoutes: NavigationRouteObject[] = [
  {
    path: "account",
    element: <AccountSettingPage />,
    label: "Account",
    Icon: AccountCircleOutlined,
  },
  {
    path: "dashboard",
    element: <DashboardPage />,
    label: "Dashboard",
    Icon: WebOutlined,
  },
  {
    path: "select-difficulty",
    element: <DifficultySelectionPage />,
    label: "PeerPrep",
    Icon: LaptopOutlined,
  },
];
