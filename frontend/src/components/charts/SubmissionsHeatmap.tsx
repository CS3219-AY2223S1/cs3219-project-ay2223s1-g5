import { useTheme } from "@mui/material/styles/";
import * as echarts from "echarts";
import ReactEcharts from "echarts-for-react";

export const SubmissionsHeatmap = () => {
  function getVirtualData(year: string) {
    const date = +echarts.number.parseDate(year + "-01-01");
    const end = +echarts.number.parseDate(+year + 1 + "-01-01");
    const dayTime = 3600 * 24 * 1000;
    const data = [];
    for (let time = date; time < end; time += dayTime) {
      // Data element consist of a date and a submission count
      data.push([new Date(time), Math.floor(Math.random() * 1000)]);
    }
    return data;
  }
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        tooltip: {
          position: "top",
          formatter: function (p: any) {
            const format = p.data[0].toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return "<b>" + p.data[1] + " submissions</b> on " + format;
          },
        },
        backgroundColor: "white",
        visualMap: {
          min: 0,
          max: 1000,
          calculable: true,
          orient: "horizontal",
          left: "center",
          top: 20,
          inRange: {
            color: [theme.palette.primary.light, theme.palette.primary.dark],
          },
        },
        calendar: [
          {
            top: 120,
            left: 30,
            right: 30,
            orient: "horizontal",
            range: "2022",
          },
        ],
        series: [
          {
            type: "heatmap",
            coordinateSystem: "calendar",
            data: getVirtualData("2022"),
          },
        ],
      }}
    />
  );
};
