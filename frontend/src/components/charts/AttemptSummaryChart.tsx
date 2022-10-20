import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

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
        },
        xAxis: {
          type: "category",
          data: [
            Difficulty.EASY.charAt(0) + Difficulty.EASY.slice(1).toLowerCase(),
            Difficulty.MEDIUM.charAt(0) +
              Difficulty.MEDIUM.slice(1).toLowerCase(),
            Difficulty.HARD.charAt(0) + Difficulty.HARD.slice(1).toLowerCase(),
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
                  color: theme.palette.green["A400"],
                },
              },
              {
                value: !attemptSummary ? 0 : attemptSummary.MEDIUM,
                itemStyle: {
                  color: theme.palette.yellow["A400"],
                },
              },
              {
                value: !attemptSummary ? 0 : attemptSummary.HARD,
                itemStyle: {
                  color: theme.palette.red["A400"],
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
