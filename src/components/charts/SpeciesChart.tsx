import ReactECharts from "echarts-for-react";
import { useMemo } from "react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

export default function SpeciesChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(data, filters.derruba);

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

    const nomes = top10.map(([nome]) => nome);
    const valores = top10.map(([, valor]) => valor);

    return {
      backgroundColor: "transparent",

      animation: true,
      animationDuration: 800,
      animationEasing: "cubicOut",

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
        formatter: (params: any) => {
          const p = params[0];

          return `
            <div style="padding:6px">
              <strong>${p.name}</strong><br/>
              Produção:
              <span style="color:#FBBF24;font-weight:bold">
                ${Number(p.value).toLocaleString("pt-BR")}
              </span>
            </div>
          `;
        },
      },

      grid: {
        top: 10,
        left: 125,
        right: 10,
        bottom: 10,
        containLabel: true,
      },

      xAxis: {
        type: "value",

        splitLine: {
          lineStyle: {
            color: "#44475A",
            opacity: 0.15,
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
          fontSize: 14,
          fontWeight: "bold",
          margin: 8,
        },
      },

      series: [
        {
          name: "Espécies",

          type: "bar",

          data: valores,

          barWidth: 30,

          itemStyle: {
            borderRadius: [0, 14, 14, 0],

            color: (params: any) => {
              const gradients = [
                ["#FCD34D", "#F59E0B"],
                ["#FBBF24", "#D97706"],
                ["#FDE68A", "#F59E0B"],
                ["#FDBA74", "#EA580C"],
                ["#FB923C", "#EA580C"],
                ["#FACC15", "#D97706"],
                ["#FCD34D", "#F59E0B"],
                ["#FDBA74", "#F97316"],
                ["#FDE68A", "#FBBF24"],
                ["#F59E0B", "#EA580C"],
              ];

              const [inicio, fim] =
                gradients[params.dataIndex] ??
                ["#FBBF24", "#F59E0B"];

              return {
                type: "linear",
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: inicio,
                  },
                  {
                    offset: 1,
                    color: fim,
                  },
                ],
              };
            },
          },
                    label: {
            show: true,
            position: "right",
            distance: 8,
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 13,
            formatter: ({ value }: any) =>
              Number(value).toLocaleString("pt-BR"),
          },

          emphasis: {
            focus: "series",

            itemStyle: {
              shadowBlur: 18,
              shadowColor: "rgba(245,158,11,0.35)",
            },
          },
        },
      ],
    };
  }, [dashboard]);

  return (
    <ReactECharts
      option={option}
      notMerge={true}
      lazyUpdate={true}
      style={{
        width: "100%",
        height: 500,
      }}
    />
  );
}