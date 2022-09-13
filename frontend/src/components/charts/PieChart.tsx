import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

export const PieChart = () => {
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        title: {
          text: "Questions Attempted",
          subtext: "By Difficulty",
          left: "center",
        },
        tooltip: {
          trigger: "item",
        },
        legend: {
          orient: "horizontal",
          bottom: "bottom",
        },
        series: [
          {
            type: "pie",
            radius: "50%",
            data: [
              {
                value: 30,
                name: "Easy",
                itemStyle: { color: theme.palette.chart.green },
              },
              {
                value: 30,
                name: "Medium",
                itemStyle: {
                  color: theme.palette.chart.yellow,
                },
              },
              {
                value: 30,
                name: "Hard",
                itemStyle: {
                  color: theme.palette.chart.red,
                },
              },
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      }}
    />
  );
};
