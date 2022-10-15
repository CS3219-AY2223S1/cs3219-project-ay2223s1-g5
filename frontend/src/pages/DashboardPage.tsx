import {
  AccessTime,
  DriveFolderUpload,
  Hub,
  People,
  Quiz,
} from "@mui/icons-material";
import { Stack } from "@mui/material";

import { DataTable } from "src/components/charts/DataTable";
import { NetworkChart } from "src/components/charts/NetworkChart";
import { ScatterPlot } from "src/components/charts/ScatterPlot";
import { SubmissionsHeatmap } from "src/components/charts/SubmissionsHeatmap";
import { VerticalBarChart } from "src/components/charts/VerticalBarChart";
import { ChartContainer } from "src/components/dashboard/ChartContainer";

export const DashboardPage = () => {
  return (
    <Stack spacing={6}>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <ChartContainer
          title={"Questions Attempted"}
          chart={<VerticalBarChart />}
          Icon={Quiz}
        />
        <ChartContainer
          title={"Time Taken Per Question"}
          chart={<ScatterPlot />}
          Icon={AccessTime}
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <ChartContainer
          title={"Topics Attempted"}
          chart={<NetworkChart />}
          Icon={Hub}
        />
        <ChartContainer
          title={"Collaborators"}
          chart={
            <DataTable
              headers={["DATE TIME", "QUESTION", "PEER"]}
              rows={[
                ["2020-04-26 00:26:55", "Question 1", "Peer 1"],
                ["2020-04-27 00:26:55", "Question 2", "Peer 2"],
                ["2020-04-28 00:27:55", "Question 3", "Peer 3"],
                ["2020-04-29 00:27:55", "Question 4", "Peer 4"],
                ["2020-04-30 00:27:55", "Question 5", "Peer 5"],
                ["2020-04-31 00:27:55", "Question 6", "Peer 6"],
                ["2020-05-01 00:27:55", "Question 7", "Peer 7"],
              ]}
            />
          }
          Icon={People}
        />
      </Stack>
      <ChartContainer
        title={"Submissions In The Last Year"}
        chart={<SubmissionsHeatmap />}
        Icon={DriveFolderUpload}
      />
    </Stack>
  );
};
