import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

export default function SpeciesChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(data, filters);

  const option = useMemo(() => {
    const especies = new Map<string, number>();

    dashboard.producao.forEach((row: any) => {
      const especie = String(
        row["Espécie"] ??
        row["ESPÉCIE"] ??
        row["ESPECIE"] ??
        "Não informada"
      ).trim();

      const quantidade = Number(
        String(row["QUANT."] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      especies.set(
        especie,
        (especies.get(especie) ?? 0) + quantidade
      );
    });

    const top10 = [...especies.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const nomes = top10.map((item) => item[0]);
    const valores = top10.map((item) => item[1]);

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
        borderColor: "#F59E0B",
        borderWidth: 1,
        textStyle: {
          color: "#F8F8F2",
        },
        valueFormatter: (value: number) =>
          value.toLocaleString("pt-BR"),
      },

      grid: {
        top: 20,
        left: 200,
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

        inverse: true,

        data: nomes,

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
          name: "Espécies",

          type: "bar",

          data: valores,

          barWidth: 20,

          itemStyle: {
            borderRadius: [0, 10, 10, 0],

            color: (params: any) => {
              const cores = [
                "#F59E0B",
                "#FBBF24",
                "#FCD34D",
                "#F97316",
                "#FB923C",
                "#FACC15",
                "#D97706",
                "#F59E0B",
                "#FDBA74",
                "#EA580C",
              ];

              return cores[params.dataIndex] ?? "#F59E0B";
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