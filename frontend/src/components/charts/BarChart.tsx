import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

export const BarChart = () => {
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        title: {
          text: "Question Sources",
          left: "center",
        },
        dataset: {
          source: [
            ["score", "quantity", "company"],
            [50, 50, "Facebook"],
            [10, 10, "Amazon"],
            [25, 25, "Netflix"],
            [40, 40, "Google"],
          ],
        },
        grid: { containLabel: true },
        xAxis: { name: "Quantity" },
        yAxis: { type: "category" },
        visualMap: {
          orient: "horizontal",
          left: "center",
          min: 1,
          max: 50,
          text: ["High", "Low"],
          // Map the score column to color
          dimension: 0,
          inRange: {
            color: [
              theme.palette.chart.red,
              theme.palette.chart.yellow,
              theme.palette.chart.green,
            ],
          },
        },
        series: [
          {
            type: "bar",
            encode: {
              // Map the "amount" column to X axis.
              x: "quantity",
              // Map the "product" column to Y axis
              y: "company",
            },
          },
        ],
      }}
    />
  );
};
