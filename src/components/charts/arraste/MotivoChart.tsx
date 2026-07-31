import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";
import { processDashboardData } from "../../../services/dataProcessor";

import ChartCard from "../../cards/ChartCard";

export default function MotivoChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  const option = useMemo(() => {
    const mapa = new Map<string, number>();

    dashboard.arraste.forEach((item: any) => {
      const motivo =
        String(item["MOTIVO"] ?? "").trim() || "Não informado";

      const qtd = Number(
        String(item["qtd"] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      mapa.set(motivo, (mapa.get(motivo) ?? 0) + qtd);
    });

    const dados = [...mapa.entries()].sort((a, b) => b[1] - a[1]);

    return {
      backgroundColor: "transparent",

      animation: true,
      animationDuration: 1800,
      animationEasing: "cubicOut",

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "rgba(30,30,30,0.95)",
        borderColor: "#50FA7B",
        borderWidth: 2,
        borderRadius: 12,
        textStyle: {
          color: "#FFFFFF",
          fontSize: 13,
        },
      },

      grid: {
        top: 30,
        left: 50,
        right: 20,
        bottom: 90,
      },

      xAxis: {
        type: "category",
        data: dados.map((d) => d[0]),

        axisLabel: {
          color: "#D6D6D6",
          rotate: 30,
          interval: 0,
          fontSize: 11,
        },

        axisTick: {
          show: false,
        },

        axisLine: {
          lineStyle: {
            color: "#555",
          },
        },
      },

      yAxis: {
        type: "value",

        axisLabel: {
          color: "#D6D6D6",
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        splitLine: {
          lineStyle: {
            color: "rgba(255,255,255,0.08)",
          },
        },
      },

      series: [
        {
          name: "Árvores",
          type: "bar",
          data: dados.map((d) => d[1]),

          barWidth: "58%",

          roundCap: true,

          label: {
            show: true,
            position: "top",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 12,
          },

          itemStyle: {
            borderRadius: [12, 12, 0, 0],

            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "#7CFF9A" },
                { offset: 0.45, color: "#50FA7B" },
                { offset: 1, color: "#14B85A" },
              ],
            },

            shadowBlur: 25,
            shadowColor: "#50FA7B",
            shadowOffsetY: 0,
          },

          emphasis: {
            focus: "series",

            itemStyle: {
              shadowBlur: 40,
              shadowColor: "#50FA7B",
            },
          },
        },
      ],
    };
  }, [dashboard]);

  return (
    <ChartCard title="STATUS">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: 380,
        }}
        notMerge={true}
        lazyUpdate={false}
      />
    </ChartCard>
  );
}