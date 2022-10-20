import { useState } from "react";
import { useTheme } from "@mui/material/styles/";
import { format } from "date-fns";
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
    } else {
      heatmapData.map((data) => {
        const formattedDate = format(new Date(data.date), "yyyy/M/d");
        if (dateSubmissionMap.has(formattedDate)) {
          const submissionCount = dateSubmissionMap.get(formattedDate);
          if (!submissionCount) {
            return;
          } else {
            const newSubmissionCount = submissionCount + 1;
            dateSubmissionMap.set(formattedDate, newSubmissionCount);
          }
        } else {
          dateSubmissionMap.set(formattedDate, 1);
        }
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
    }
    return data;
  };

  return (
    <ReactEcharts
      option={{
        tooltip: {
          position: "top",
          formatter: (params: any) => {
            const format = params.data[0].toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
            return "<b>" + params.data[1] + " submissions</b> on " + format;
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
            range: [new Date().getFullYear()],
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
