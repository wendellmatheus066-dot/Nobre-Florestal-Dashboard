import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import * as echarts from "echarts";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

export default function ProductionChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.derruba
  );

  const option = useMemo(() => {
    const agrupado: Record<string, number> = {};

    dashboard.producao.forEach((row: any) => {
      let dia = String(
        row["Data do Corte"] ?? ""
      ).trim();

      if (dia.includes("/")) {
        const partes = dia
          .substring(0, 10)
          .split("/");

        if (partes.length === 3) {
          if (partes[2].length === 2) {
            partes[2] = "20" + partes[2];
          }

          dia =
            partes[0].padStart(2, "0") +
            "/" +
            partes[1].padStart(2, "0") +
            "/" +
            partes[2];
        }
      } else if (dia.includes("-")) {
        const partes = dia
          .substring(0, 10)
          .split("-");

        if (partes.length === 3) {
          dia =
            partes[2] +
            "/" +
            partes[1] +
            "/" +
            partes[0];
        }
      }

      const quantidade = Number(
        String(row["QUANT."] ?? 0)
          .replace(/\./g, "")
          .replace(",", ".")
      );

      agrupado[dia] =
        (agrupado[dia] || 0) + quantidade;
    });

    const dias = Object.keys(agrupado).sort(
      (a, b) => {
        const da = a
          .split("/")
          .reverse()
          .join("-");

        const db = b
          .split("/")
          .reverse()
          .join("-");

        return (
          new Date(da).getTime() -
          new Date(db).getTime()
        );
      }
    );

    const valores = dias.map(
      (d) => agrupado[d]
    );

    return {
      backgroundColor: "transparent",

      animationDuration: 800,

      tooltip: {
        trigger: "axis",
        backgroundColor: "#282A36",
        borderColor: "#50FA7B",
        borderWidth: 1,
        textStyle: {
          color: "#F8F8F2",
        },
      },

      grid: {
        left: 50,
        right: 25,
        top: 20,
        bottom: 45,
      },

      xAxis: {
        type: "category",
        data: dias,
        boundaryGap: false,

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
          rotate: 30,
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
          type: "line",

          data: valores,

          smooth: true,

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
                  color:
                    "rgba(80,250,123,0.35)",
                },
                {
                  offset: 1,
                  color:
                    "rgba(80,250,123,0.03)",
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
    <ReactECharts
      option={option}
      style={{
        height: 420,
        width: "100%",
      }}
    />
  );
}