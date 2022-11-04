import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

import { titleCase } from "src/utils/string";

import { Difficulty } from "~shared/types/base/index";

type AttemptSummaryProps = {
  attemptSummary: Record<Difficulty, number> | undefined;
};

export const AttemptSummaryChart = ({
  attemptSummary,
}: AttemptSummaryProps) => {
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        title: {
          left: "center",
        },
        tooltip: {
          trigger: "item",
          formatter: (params: { data: { value: number } }) => {
            const attempts = params.data.value;
            return "Questions Attempted: <b>" + attempts + "</b>";
          },
        },
        xAxis: {
          type: "category",
          data: [
            titleCase(Difficulty.EASY),
            titleCase(Difficulty.MEDIUM),
            titleCase(Difficulty.HARD),
          ],
        },
        yAxis: {
          name: "Attempts",
          type: "value",
        },
        backgroundColor: "white",
        series: [
          {
            data: [
              {
                value: !attemptSummary ? 0 : attemptSummary.EASY,
                itemStyle: {
                  color: theme.palette.green["500"],
                },
              },
              {
                value: !attemptSummary ? 0 : attemptSummary.MEDIUM,
                itemStyle: {
                  color: theme.palette.amber["700"],
                },
              },
              {
                value: !attemptSummary ? 0 : attemptSummary.HARD,
                itemStyle: {
                  color: theme.palette.red["600"],
                },
              },
            ],
            type: "bar",
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
