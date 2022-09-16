import { RouteObject } from "react-router-dom";
import {
  LaptopOutlined,
  Settings,
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

export const DisplayedNavigationBarRoutes = [
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

export const HiddenNavigationBarRoutes = [
  {
    path: "settings",
    element: <AccountSettingPage />,
    label: "Settings",
    Icon: Settings,
  },
];

export const NavigationBarRoutes: NavigationRouteObject[] = [
  ...HiddenNavigationBarRoutes,
  ...DisplayedNavigationBarRoutes,
];
