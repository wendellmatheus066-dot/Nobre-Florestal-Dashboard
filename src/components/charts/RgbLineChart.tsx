import ReactECharts from "echarts-for-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as echarts from "echarts";

type Props = {
  labels: string[];
  values: number[];
};

export default function RgbLineChart({ labels, values }: Props) {
  const chartRef = useRef<ReactECharts>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setOffset((v) => (v + 0.02) % 1);
    }, 40);

    return () => clearInterval(timer);
  }, []);

  const cores = useMemo(() => {
    return [
      { offset: (0.00 + offset) % 1, color: "#00ff88" },
      { offset: (0.20 + offset) % 1, color: "#00ffff" },
      { offset: (0.40 + offset) % 1, color: "#0080ff" },
      { offset: (0.60 + offset) % 1, color: "#ff00ff" },
      { offset: (0.80 + offset) % 1, color: "#ffff00" },
      { offset: 1, color: "#00ff88" },
    ].sort((a, b) => a.offset - b.offset);
  }, [offset]);

  const option = useMemo(
    () => ({
      backgroundColor: "transparent",

      animation: false,

      tooltip: {
        trigger: "axis",
      },

      grid: {
        left: 50,
        right: 25,
        top: 20,
        bottom: 45,
      },

      xAxis: {
        type: "category",
        data: labels,
        boundaryGap: false,
      },

      yAxis: {
        type: "value",
      },

      series: [
        {
          type: "line",
          data: values,
          smooth: true,
          symbol: "circle",
          symbolSize: 8,

          lineStyle: {
            width: 5,
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              1,
              0,
              cores
            ),
          },

          itemStyle: {
            color: "#ffffff",
            borderColor: "#00ff88",
            borderWidth: 3,
            shadowBlur: 18,
            shadowColor: "#00ff88",
          },

          areaStyle: {
            color: new echarts.graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: "rgba(0,255,170,0.35)",
                },
                {
                  offset: 1,
                  color: "rgba(0,255,170,0.02)",
                },
              ]
            ),
          },
        },
      ],
    }),
    [labels, values, cores]
  );

  return (
    <ReactECharts
      ref={chartRef}
      option={option}
      style={{
        width: "100%",
        height: 420,
      }}
    />
  );
}