import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

export default function RankingChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(data, filters.derruba);

  const option = useMemo(() => {
    const ranking: Record<string, number> = {};

    dashboard.producao.forEach((row: any) => {
      const operador =
        row["Motoserrista Corte"] ??
        row["OPERADOR"] ??
        "Sem nome";

      const quantidade = Number(
        String(row["QUANT."] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      ranking[operador] = (ranking[operador] || 0) + quantidade;
    });

    const top5 = Object.entries(ranking)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

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
        textStyle: {
          color: "#F8F8F2",
        },
      },

      grid: {
        left: 170,
        right: 40,
        top: 20,
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
        },
      },

      yAxis: {
        type: "category",
        inverse: true,
        data: top5.map((item) => item[0]),
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
          data: top5.map((item) => item[1]),
          barWidth: 22,
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
        },
      ],
    };
  }, [dashboard]);

  return (
    <ReactECharts
      option={option}
      style={{
        height: 420,
        width: "100%",
      }}
    />
  );
}