import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

import { Difficulty } from "~shared/types/base/index";

type DurationSummaryProps = {
  durationSummary:
    | {
        difficulty: Difficulty;
        timetaken: number;
        date: Date;
      }[]
    | undefined;
};

export const DurationSummaryChart = ({
  durationSummary,
}: DurationSummaryProps) => {
  const theme = useTheme();

  const processDates = (
    durationSummary:
      | {
          difficulty: Difficulty;
          timetaken: number;
          date: Date;
        }[]
      | undefined,
  ) => {
    const xAxis = new Set<string>();
    if (!durationSummary) {
      return;
    } else {
      // Sort the durationSummary first
      durationSummary.sort((a, b) => a.date.getTime() - b.date.getTime());
      // Then process it
      durationSummary.map((duration) => {
        const today = new Date();
        const oneMonthAgo = new Date(
          new Date().setMonth(new Date().getMonth() - 1),
        );
        const attemptDate = duration.date;
        if (attemptDate >= oneMonthAgo && attemptDate <= today) {
          const date =
            attemptDate.getDate() +
            "/" +
            (attemptDate.getMonth() + 1) +
            "/" +
            attemptDate.getFullYear();
          xAxis.add(date);
        }
      });
      return Array.from(xAxis);
    }
  };

  const processData = (
    durationSummary:
      | {
          difficulty: Difficulty;
          timetaken: number;
          date: Date;
        }[]
      | undefined,
  ) => {
    const points = new Set<{
      value: (string | number)[];
      itemStyle: { color: string | undefined };
    }>();
    if (!durationSummary) {
      return;
    } else {
      durationSummary.map((duration) => {
        const difficulty = duration.difficulty;
        const timetaken = duration.timetaken;
        const attemptDate = duration.date;
        const color =
          difficulty === "EASY"
            ? theme.palette.green["A400"]
            : difficulty === "MEDIUM"
            ? theme.palette.yellow["A400"]
            : difficulty === "HARD"
            ? theme.palette.red["A400"]
            : undefined;
        const date =
          attemptDate.getDate() +
          "/" +
          (attemptDate.getMonth() + 1) +
          "/" +
          attemptDate.getFullYear();
        const point = { value: [date, timetaken], itemStyle: { color: color } };
        points.add(point);
      });
      return Array.from(points);
    }
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          trigger: "item",
        },
        xAxis: {
          data: !durationSummary ? [] : processDates(durationSummary),
        },
        yAxis: { name: "Minutes" },
        backgroundColor: "white",
        series: [
          {
            symbolSize: 15,
            data: !durationSummary ? [] : processData(durationSummary),
            type: "scatter",
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
              focus: "self",
            },
          },
        ],
      }}
    />
  );
};
