import { useTheme } from "@mui/material/styles/";
import { format, subDays } from "date-fns";
import ReactEcharts from "echarts-for-react";

import { Difficulty } from "~shared/types/base/index";

type DurationSummaryProps = {
  durationSummary:
    | {
        difficulty: Difficulty | string;
        timetaken: number;
        date: Date | string;
      }[]
    | undefined;
};

export const DurationSummaryChart = ({
  durationSummary,
}: DurationSummaryProps) => {
  const theme = useTheme();
  const getPastThirtyDays = () => {
    const today = new Date();
    const thirtyDaysAgo = subDays(new Date(), 30);
    const xAxis = [];
    for (
      let date = thirtyDaysAgo;
      date <= today;
      date.setDate(date.getDate() + 1)
    ) {
      xAxis.push(format(new Date(date), "d/M"));
    }
    return xAxis;
  };

  const processData = (
    durationSummary:
      | {
          difficulty: Difficulty | string;
          timetaken: number;
          date: Date | string;
        }[]
      | undefined,
  ) => {
    const points = new Set<{
      value: (string | number)[];
      itemStyle: { color: string | undefined };
    }>();
    if (!durationSummary) {
      return;
    }
    durationSummary.map((duration) => {
      const difficulty = duration.difficulty;
      const timetaken = Number((duration.timetaken / 60).toFixed(2));
      const attemptDate = duration.date;
      const color =
        difficulty === Difficulty.EASY
          ? theme.palette.green["A400"]
          : difficulty === Difficulty.MEDIUM
          ? theme.palette.yellow["A400"]
          : difficulty === Difficulty.HARD
          ? theme.palette.red["A400"]
          : undefined;
      const date = format(new Date(attemptDate), "d/M");
      const point = { value: [date, timetaken], itemStyle: { color: color } };
      points.add(point);
    });
    return Array.from(points);
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          trigger: "item",
          formatter: (params: { data: { value: [string, number] } }) => {
            const date = params.data.value[0];
            const timetaken = params.data.value[1];
            return "Time Taken (Minutes): <b>" + timetaken + " </b> on " + date;
          },
        },
        xAxis: {
          data: getPastThirtyDays(),
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
