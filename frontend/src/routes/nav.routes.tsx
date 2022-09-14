import { RouteObject } from "react-router-dom";
import {
  LaptopOutlined,
  SvgIconComponent,
  WebOutlined,
} from "@mui/icons-material";

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
