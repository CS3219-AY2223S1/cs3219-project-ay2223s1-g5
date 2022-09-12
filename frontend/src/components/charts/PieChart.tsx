import ReactEcharts from "echarts-for-react";

export const PieChart = () => {
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
              { value: 1048, name: "Easy", itemStyle: { color: "#91cc75" } },
              {
                value: 735,
                name: "Medium",
                itemStyle: {
                  color: "#fac858",
                },
              },
              {
                value: 580,
                name: "Hard",
                itemStyle: {
                  color: "#ee6666",
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
