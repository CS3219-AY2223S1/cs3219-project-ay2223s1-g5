import { RouteObject } from "react-router-dom";
import {
  AccountCircleOutlined,
  LaptopOutlined,
  SvgIconComponent,
  WebOutlined,
} from "@mui/icons-material";

import { AccountSettingPage } from "src/pages/AccountSettingPage";
import { DashboardPage } from "src/pages/DashboardPage";
import { PeerPrepPage } from "src/pages/PeerPrepPage";

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
    path: "peerprep",
    element: <PeerPrepPage />,
    label: "PeerPrep",
    Icon: LaptopOutlined,
  },
];
