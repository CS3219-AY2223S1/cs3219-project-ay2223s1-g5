import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

export const ScatterPlot = () => {
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        tooltip: {
          trigger: "item",
        },
        xAxis: {
          name: "Day",
          data: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        },
        yAxis: { name: "Minutes" },
        series: [
          {
            symbolSize: 15,
            data: [
              {
                value: [0, 1],
                itemStyle: {
                  color: theme.palette.chart.green,
                },
              },
              {
                value: [0, 3],
                itemStyle: {
                  color: theme.palette.chart.red,
                },
              },
              {
                value: [1, 4],
                itemStyle: {
                  color: theme.palette.chart.yellow,
                },
              },
              {
                value: [2, 3],
                itemStyle: {
                  color: theme.palette.chart.red,
                },
              },
              {
                value: [3, 7],
                itemStyle: {
                  color: theme.palette.chart.green,
                },
              },
              {
                value: [4, 6],
                itemStyle: {
                  color: theme.palette.chart.yellow,
                },
              },
              {
                value: [5, 6],
                itemStyle: {
                  color: theme.palette.chart.yellow,
                },
              },
              {
                value: [6, 9],
                itemStyle: {
                  color: theme.palette.chart.green,
                },
              },
            ],
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
