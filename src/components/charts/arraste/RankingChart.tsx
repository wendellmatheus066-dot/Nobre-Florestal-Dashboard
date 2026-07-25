import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";
import { processDashboardData } from "../../../services/dataProcessor";

import ChartCard from "../../cards/ChartCard";

export default function RankingChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  const option = useMemo(() => {
    const ranking = new Map<string, number>();

    dashboard.arraste.forEach((item: any) => {
      const operador = String(item["Skideiro Patio"] ?? "").trim();

      if (!operador) return;

      const qtd = Number(
        String(item["qtd"] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      ranking.set(
        operador,
        (ranking.get(operador) ?? 0) + qtd
      );
    });

    const dados = [...ranking.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    return {
      backgroundColor: "transparent",

      animationDuration: 800,

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "#282A36",
        borderColor: "#50FA7B",
        borderWidth: 1,
        textStyle: {
          color: "#F8F8F2",
        },
      },

      grid: {
        top: 20,
        left: 120,
        right: 30,
        bottom: 20,
      },

      xAxis: {
        type: "value",

        splitLine: {
          lineStyle: {
            color: "#44475A",
          },
        },

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#BDC1D6",
          fontSize: 12,
        },
      },

      yAxis: {
        type: "category",

        data: dados.map((d) => d[0]),

        axisLine: {
          show: false,
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#F8F8F2",
          fontSize: 13,
          fontWeight: "bold",
        },
      },

      series: [
        {
          type: "bar",

          data: dados.map((d) => d[1]),

          barWidth: 18,

          itemStyle: {
            color: "#50FA7B",
            borderRadius: [0, 10, 10, 0],
          },

          label: {
            show: true,
            position: "right",
            color: "#FFFFFF",
            fontWeight: "bold",
          },

          emphasis: {
            focus: "series",
          },
        },
      ],
    };
  }, [dashboard]);

  return (
    <ChartCard title="Ranking dos Skideiros">
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