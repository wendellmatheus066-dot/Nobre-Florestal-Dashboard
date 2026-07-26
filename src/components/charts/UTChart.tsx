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

    // Ordena do maior para o menor
    const ranking = [...uts.entries()].sort(
      (a, b) => b[1] - a[1]
    );

    const categorias = ranking.map(([ut]) => ut);
    const valores = ranking.map(([, valor]) => valor);

    return {
      backgroundColor: "transparent",

      animation: true,
      animationDuration: 800,

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
        formatter: (params: any) => {
          const p = params[0];

          return `
            <div style="padding:4px">
              <strong>UT ${p.name}</strong><br/>
              Produção:
              <strong style="color:#60A5FA">
                ${Number(p.value).toLocaleString("pt-BR")}
              </strong>
            </div>
          `;
        },
      },

      grid: {
        top: 15,
        left: 80,
        right: 45,
        bottom: 15,
        containLabel: true,
      },

      xAxis: {
        type: "value",

        splitLine: {
          lineStyle: {
            color: "#44475A",
            opacity: 0.35,
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

          barWidth: 24,

          itemStyle: {
            borderRadius: [0, 10, 10, 0],

            color: (params: any) => {
              const cores = [
                "#1D4ED8",
                "#2563EB",
                "#3B82F6",
                "#4F8EF7",
                "#60A5FA",
                "#93C5FD",
                "#60A5FA",
                "#4F8EF7",
                "#3B82F6",
              ];

              return cores[params.dataIndex] ?? "#4F8EF7";
            },
          },

          label: {
            show: true,
            position: "right",
            color: "#FFFFFF",
            fontWeight: "bold",
            fontSize: 12,
            formatter: ({ value }: any) =>
              Number(value).toLocaleString("pt-BR"),
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