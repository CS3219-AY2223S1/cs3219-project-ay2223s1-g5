import { useState } from "react";
import { useTheme } from "@mui/material/styles/";
import { endOfDay, format, startOfDay, subYears } from "date-fns";
import ReactEcharts from "echarts-for-react";

type SubmissionHeatmapProps = {
  heatmapData:
    | {
        date: Date | string;
      }[]
    | undefined;
};

export const SubmissionsHeatmap = ({ heatmapData }: SubmissionHeatmapProps) => {
  const theme = useTheme();
  const [maxSubmissions, setMaxSubmissions] = useState<number>(0);

  const processData = (
    heatmapData:
      | {
          date: Date | string;
        }[]
      | undefined,
  ) => {
    const dateSubmissionMap = new Map<string, number>();
    const data = [];
    if (!heatmapData) {
      return;
    }
    heatmapData.map((data) => {
      const formattedDate = format(new Date(data.date), "yyyy-MM-dd");
      const submissionCount = dateSubmissionMap.get(formattedDate) || 0;
      dateSubmissionMap.set(formattedDate, submissionCount + 1);
    });
    for (const entry of dateSubmissionMap.entries()) {
      const date = entry[0];
      const submissions = entry[1];
      data.push([new Date(date), submissions]);
      // Find largest number of submissions in the year to set range of submission values
      if (submissions > maxSubmissions) {
        setMaxSubmissions(submissions);
      }
    }
    return data;
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          confine: true,
          position: "top",
          formatter: (params: { data: [Date, number] }) => {
            const date = params.data[0];
            const submissions = params.data[1];
            const formattedDate = format(date, "dd MMM yyyy");
            return (
              "Submissions: <b>" + submissions + "</b> on " + formattedDate
            );
          },
        },
        backgroundColor: "white",
        visualMap: {
          min: 0,
          max: maxSubmissions,
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
            range: [startOfDay(subYears(new Date(), 1)), endOfDay(new Date())],
          },
        ],
        series: [
          {
            type: "heatmap",
            coordinateSystem: "calendar",
            data: processData(heatmapData),
          },
        ],
      }}
    />
  );
};
