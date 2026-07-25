import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";
import { processDashboardData } from "../../../services/dataProcessor";
import ChartCard from "../../cards/ChartCard";

export default function UTChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  const option = useMemo(() => {
    const mapa = new Map<string, number>();

    dashboard.arraste.forEach((item: any) => {
      const ut = String(item["UT"] ?? "").trim();

      if (!ut) return;

      const qtd = Number(
        String(item["qtd"] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      mapa.set(ut, (mapa.get(ut) ?? 0) + qtd);
    });

    const dados = [...mapa.entries()].sort((a, b) => b[1] - a[1]);

    return {
      backgroundColor: "transparent",

      tooltip: {
        trigger: "item",
        backgroundColor: "#282A36",
        borderColor: "#50FA7B",
        borderWidth: 1,
        textStyle: {
          color: "#fff",
        },
      },

      legend: {
        bottom: 0,
        textStyle: {
          color: "#BDC1D6",
        },
      },

      series: [
        {
          name: "UT",
          type: "pie",
          radius: ["45%", "70%"],
          avoidLabelOverlap: true,

          itemStyle: {
            borderColor: "#282A36",
            borderWidth: 3,
          },

          label: {
            color: "#fff",
            formatter: "{b}\n{c}",
          },

          emphasis: {
            label: {
              fontSize: 18,
              fontWeight: "bold",
            },
          },

          data: dados.map(([ut, valor]) => ({
            name: ut,
            value: valor,
          })),
        },
      ],
    };
  }, [dashboard.arraste]);

  return (
    <ChartCard title="Produção por UT">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: 380,
        }}
      />
    </ChartCard>
  );
}