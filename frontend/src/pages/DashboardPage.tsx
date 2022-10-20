import { useEffect, useState } from "react";
import {
  AccessTime,
  DriveFolderUpload,
  Hub,
  People,
  Quiz,
} from "@mui/icons-material";
import { Box, Stack } from "@mui/material";

import { AttemptSummaryChart } from "src/components/charts/AttemptSummaryChart";
import { DataTable } from "src/components/charts/DataTable";
import { DurationSummaryChart } from "src/components/charts/DurationSummaryChart";
import { NetworkChart } from "src/components/charts/NetworkChart";
import { SubmissionsHeatmap } from "src/components/charts/SubmissionsHeatmap";
import { ChartContainer } from "src/components/dashboard/ChartContainer";
import { Title } from "src/components/Title";
import { useGetUserStatistics } from "src/hooks/useStatistics";

import { Difficulty } from "~shared/types/base/index";

export const DashboardPage = () => {
  const { statistics } = useGetUserStatistics();
  const [attemptSummary, setAttemptSummary] = useState<
    Record<Difficulty | string, number> | undefined
  >();
  const [durationSummary, setDurationSummary] = useState<
    | {
        difficulty: Difficulty | string;
        timetaken: number;
        date: Date | string;
      }[]
    | undefined
  >();
  const [peerSummary, setPeerSummary] = useState<
    | {
        userName: string;
        questionTitle: string;
        date: Date | string;
      }[]
    | undefined
  >();
  const [heatmapData, setHeatmapData] = useState<
    | {
        date: Date | string;
      }[]
    | undefined
  >();
  const [networkData, setNetworkData] = useState<
    | {
        topics: {
          id: number;
          name: string;
          count: number;
        }[];
        links: {
          smallTopicId: number;
          largeTopicId: number;
        }[];
      }
    | undefined
  >();

  useEffect(() => {
    if (!statistics) {
      return;
    }
    setAttemptSummary(statistics.attemptSummary);
    setDurationSummary(statistics.durationSummary);
    setPeerSummary(statistics.peerSummary);
    setHeatmapData(statistics.heatmapData);
    setNetworkData(statistics.networkData);
  }, [statistics]);

  return (
    <Stack spacing={3}>
      <Title title="Dashboard" />
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <ChartContainer
          title={"Questions Attempted"}
          chart={<AttemptSummaryChart attemptSummary={attemptSummary} />}
          Icon={Quiz}
        />
        <ChartContainer
          title={"Time Taken Per Question"}
          chart={<DurationSummaryChart durationSummary={durationSummary} />}
          Icon={AccessTime}
        />
      </Stack>
      <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
        <ChartContainer
          title={"Topics Attempted"}
          chart={<NetworkChart networkData={networkData} />}
          Icon={Hub}
        />
        <ChartContainer
          title={"Collaborators"}
          chart={
            <Box sx={{ height: "300px", overflowY: "auto" }}>
              <DataTable
                headers={["DATE TIME", "QUESTION", "PEER"]}
                rows={
                  !peerSummary
                    ? []
                    : peerSummary.map((summary) => {
                        return [
                          summary.date.toString(),
                          summary.questionTitle,
                          summary.userName,
                        ];
                      })
                }
              />
            </Box>
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
