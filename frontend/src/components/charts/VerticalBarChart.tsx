import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

export const VerticalBarChart = () => {
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
          // name: "Difficulty",
          type: "category",
          data: ["Easy", "Medium", "Hard"],
        },
        yAxis: {
          name: "Minutes",
          type: "value",
        },
        backgroundColor: "white",
        series: [
          {
            data: [
              {
                value: 5,
                itemStyle: {
                  color: theme.palette.green[500],
                },
              },
              {
                value: 10,
                itemStyle: {
                  color: theme.palette.yellow[500],
                },
              },
              {
                value: 15,
                itemStyle: {
                  color: theme.palette.red[500],
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
