import { useTheme } from "@mui/material/styles/";
import ReactEcharts from "echarts-for-react";

type NetworkChartProps = {
  networkData:
    | {
        topics: {
          id: number;
          name: string;
          count: number;
        }[];
        links: {
          smallTopicId: number;
          largeTopicId: number;
        }[];
      }
    | undefined;
};

export const NetworkChart = ({ networkData }: NetworkChartProps) => {
  const processNodes = (
    topics:
      | {
          id: number;
          name: string;
          count: number;
        }[]
      | undefined,
  ) => {
    const nodes = new Set<{
      id: string;
      name: string;
      symbolSize: number;
      value: number;
    }>();
    if (!topics) {
      return;
    } else {
      topics.map((topic) => {
        const stringId = topic["id"].toString();
        const { count: symbolSize, count: value, id, ...rest } = topic;
        const node = { symbolSize, value, id: stringId, ...rest };
        nodes.add(node);
      });
      return Array.from(nodes);
    }
  };

  const processLinks = (
    edges:
      | {
          smallTopicId: number;
          largeTopicId: number;
        }[]
      | undefined,
  ) => {
    const links = new Set<{ source: string; target: string }>();
    if (!edges) {
      return;
    } else {
      edges.map((edge) => {
        const sourceStringId = edge["smallTopicId"].toString();
        const targetStringId = edge["largeTopicId"].toString();
        const link = { source: sourceStringId, target: targetStringId };
        links.add(link);
      });
      return Array.from(links);
    }
  };

  const data = {
    nodes: !networkData ? [] : processNodes(networkData.topics),
    links: !networkData ? [] : processLinks(networkData.links),
  };
  const theme = useTheme();
  return (
    <ReactEcharts
      option={{
        tooltip: {
          formatter: "Questions Attempted: {c0}",
        },
        backgroundColor: "white",
        animationDuration: 1500,
        animationEasingUpdate: "quinticInOut",
        series: [
          {
            type: "graph",
            layout: "force",
            draggable: true,
            force: {
              // repulsion: [200, 400],
              friction: 0.3,
              gravity: 0.03,
            },
            data: data.nodes,
            links: data.links,
            roam: true,
            itemStyle: {
              opacity: 0.8,
              color: theme.palette.primary.main,
            },
            label: {
              position: "right",
              formatter: "{b}",
              show: true,
              fontSize: 13,
              fontFamily: "sans-serif",
            },
            lineStyle: {
              // color: "source",
              curveness: 0,
              width: 1.5,
            },
            emphasis: {
              focus: "adjacency", // Known bug - Causes buggy legend hovering. https://github.com/apache/echarts/issues/13869 Will resolve buggy hovering using CSS disable hovering
              lineStyle: {
                width: 4,
              },
            },
          },
        ],
      }}
    />
  );
};
