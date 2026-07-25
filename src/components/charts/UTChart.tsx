import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

export default function UTChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.derruba
  );

  const option = useMemo(() => {
    const uts = new Map<string, number>();

    dashboard.producao.forEach((row: any) => {
      const ut = String(row["UT"] ?? "Sem UT").trim();

      const quantidade = Number(
        String(row["QUANT."] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      uts.set(
        ut,
        (uts.get(ut) ?? 0) + quantidade
      );
    });

    const ranking = [...uts.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    const categorias = ranking.map((item) => item[0]);
    const valores = ranking.map((item) => item[1]);

    return {
      backgroundColor: "transparent",

      animation: true,
      animationDuration: 700,

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        backgroundColor: "#282A36",
        borderColor: "#4F8EF7",
        borderWidth: 1,
        textStyle: {
          color: "#F8F8F2",
        },
        valueFormatter: (value: number) =>
          value.toLocaleString("pt-BR"),
      },

      grid: {
        top: 20,
        left: 90,
        right: 35,
        bottom: 20,
        containLabel: true,
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

        data: categorias,

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
          name: "Produção",

          type: "bar",

          data: valores,

          barWidth: 20,

          itemStyle: {
            borderRadius: [0, 10, 10, 0],

            color: (params: any) => {
              const cores = [
                "#4F8EF7",
                "#60A5FA",
                "#3B82F6",
                "#2563EB",
                "#1D4ED8",
                "#93C5FD",
                "#2563EB",
                "#60A5FA",
                "#4F8EF7",
              ];

              return cores[params.dataIndex] ?? "#4F8EF7";
            },
          },

          label: {
            show: true,
            position: "right",
            color: "#FFFFFF",
            fontWeight: "bold",
            formatter: "{c}",
          },

          emphasis: {
            focus: "series",
          },
        },
      ],
    };
  }, [dashboard.producao]);

  return (
    <ReactECharts
      option={option}
      notMerge={true}
      lazyUpdate={true}
      style={{
        width: "100%",
        height: 420,
      }}
    />
  );
}