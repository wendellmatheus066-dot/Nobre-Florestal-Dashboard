import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import * as echarts from "echarts";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";
import { processDashboardData } from "../../../services/dataProcessor";
import ChartCard from "../../cards/ChartCard";

export default function ProductionChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  // Apenas para teste (pode apagar depois)
  if (dashboard.arraste.length > 0) {
    console.log("Data Patio:", dashboard.arraste[0]["Data Patio"]);
    console.log("Tipo:", typeof dashboard.arraste[0]["Data Patio"]);
  } else {
    console.log("Arraste vazio");
  }

  const option = useMemo(() => {
    const agrupado = new Map<string, number>();

    dashboard.arraste.forEach((row: any) => {
      if (!row) return;

      let dataPatio = String(row["Data Patio"] ?? "").trim();

      if (!dataPatio) return;

      // Padroniza yyyy-mm-dd -> dd/MM/yyyy
      if (dataPatio.includes("-")) {
        const partes = dataPatio.substring(0, 10).split("-");

        if (partes.length === 3) {
          dataPatio =
            partes[2].padStart(2, "0") +
            "/" +
            partes[1].padStart(2, "0") +
            "/" +
            partes[0];
        }
      }

      // Padroniza dd/MM/yy -> dd/MM/yyyy
      else if (dataPatio.includes("/")) {
        const partes = dataPatio.substring(0, 10).split("/");

        if (partes.length === 3) {
          let ano = partes[2];

          if (ano.length === 2) {
            ano = "20" + ano;
          }

          dataPatio =
            partes[0].padStart(2, "0") +
            "/" +
            partes[1].padStart(2, "0") +
            "/" +
            ano;
        }
      }

      const quantidade = Number(
        String(row["qtd"] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      agrupado.set(
        dataPatio,
        (agrupado.get(dataPatio) ?? 0) + quantidade
      );
    });

    const dias = [...agrupado.keys()].sort((a, b) => {
      const [diaA, mesA, anoA] = a.split("/").map(Number);
      const [diaB, mesB, anoB] = b.split("/").map(Number);

      return (
        new Date(anoA, mesA - 1, diaA).getTime() -
        new Date(anoB, mesB - 1, diaB).getTime()
      );
    });

    const valores = dias.map((dia) => agrupado.get(dia) ?? 0);

    return {
      backgroundColor: "transparent",

      animation: true,
      animationDuration: 800,

      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
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
        left: 50,
        right: 25,
        bottom: 45,
      },

      xAxis: {
        type: "category",
        boundaryGap: false,
        data: dias,

        axisLine: {
          lineStyle: {
            color: "#44475A",
          },
        },

        axisTick: {
          show: false,
        },

        axisLabel: {
          color: "#BDC1D6",
          fontSize: 12,
          formatter: (value: string) => value,
        },
      },

      yAxis: {
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

      series: [
        {
          name: "Árvores",
          type: "line",
          smooth: true,
          data: valores,

          symbol: "circle",
          symbolSize: 8,

          lineStyle: {
            width: 4,
            color: "#50FA7B",
          },

          itemStyle: {
            color: "#50FA7B",
            borderColor: "#282A36",
            borderWidth: 2,
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
                  color: "rgba(80,250,123,0.35)",
                },
                {
                  offset: 1,
                  color: "rgba(80,250,123,0.03)",
                },
              ]
            ),
          },

          emphasis: {
            focus: "series",
          },
        },
      ],
    };
  }, [dashboard]);

  return (
    <ChartCard title="Produção por Dia">
      <ReactECharts
        option={option}
        style={{
          width: "100%",
          height: 420,
        }}
        notMerge={true}
        lazyUpdate={false}
      />
    </ChartCard>
  );
}