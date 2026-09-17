import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import { useExcel } from "../../hooks/useExcel";
import { useFilters } from "../../context/FilterContext";
import { processDashboardData } from "../../services/dataProcessor";

function converterNumero(valor: any): number {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return 0;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor)
      ? valor
      : 0;
  }

  let texto = String(valor)
    .trim()
    .replace(/\s/g, "");

  if (
    texto.includes(".") &&
    texto.includes(",")
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

export default function UTChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.derruba
  );

  const graficoUT = useMemo(() => {
    const mapa = new Map<string, number>();

    for (const row of dashboard.producao) {
      const ut = String(
        row["UT"] ??
        row["UT "] ??
        row["UT Nº"] ??
        row["Nº UT"] ??
        ""
      ).trim();

      if (!ut) {
        continue;
      }

      const quantidade = converterNumero(
        row["QUANT."] ??
        row["QUANT"] ??
        row["QTD"] ??
        row["QUANTIDADE"] ??
        1
      );

      mapa.set(
        ut,
        (mapa.get(ut) ?? 0) + quantidade
      );
    }

    return Array.from(mapa.entries())
      .map(([nome, producao]) => ({
        nome,
        producao,
      }))
      .sort(
        (a, b) =>
          b.producao - a.producao
      );
  }, [dashboard.producao]);

  if (graficoUT.length === 0) {
    return (
      <div className="flex min-h-[430px] items-center justify-center text-sm font-semibold text-[#7F87A8]">
        Nenhuma UT encontrada nos dados.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={{
          animation: true,
          animationDuration: 700,

          grid: {
            left: 52,
            right: 58,
            top: 12,
            bottom: 20,
            containLabel: true,
          },

          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            backgroundColor: "#21222C",
            borderColor: "#00D084",
            textStyle: {
              color: "#FFFFFF",
              fontWeight: 700,
            },
            formatter: (params: any[]) => {
              const p = params?.[0];

              return [
                `<b>UT ${p?.name ?? ""}</b>`,
                `Produção: <b>${Number(
                  p?.value ?? 0
                ).toLocaleString(
                  "pt-BR"
                )}</b> árvores`,
              ].join("<br/>");
            },
          },

          xAxis: {
            type: "value",
            min: 0,

            axisLabel: {
              color: "#7F87A8",
              fontSize: 10,
              fontWeight: 700,
            },

            axisLine: {
              show: false,
            },

            axisTick: {
              show: false,
            },

            splitLine: {
              lineStyle: {
                color:
                  "rgba(255,255,255,0.055)",
              },
            },
          },

          yAxis: {
            type: "category",
            inverse: true,
            data: graficoUT.map(
              (item) => item.nome
            ),

            axisLabel: {
              color: "#BDC1D6",
              fontSize: 11,
              fontWeight: 800,
              margin: 14,
            },

            axisLine: {
              show: false,
            },

            axisTick: {
              show: false,
            },
          },

          series: [
            {
              name: "Produção",
              type: "bar",

              data: graficoUT.map(
                (item) => item.producao
              ),

              // Barras menores e separadas.
              barWidth: 13,
              barCategoryGap: "55%",

              itemStyle: {
                borderRadius: [
                  0,
                  8,
                  8,
                  0,
                ],
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 1,
                  y2: 0,
                  colorStops: [
                    {
                      offset: 0,
                      color: "#00A8FF",
                    },
                    {
                      offset: 0.55,
                      color: "#4C8BF5",
                    },
                    {
                      offset: 1,
                      color: "#8BE9FD",
                    },
                  ],
                },
              },

              label: {
                show: true,
                position: "right",
                distance: 8,
                color: "#FFFFFF",
                fontSize: 11,
                fontWeight: 900,

                formatter: (params: any) =>
                  Number(
                    params.value
                  ).toLocaleString(
                    "pt-BR"
                  ),
              },

              emphasis: {
                itemStyle: {
                  shadowBlur: 14,
                  shadowColor:
                    "rgba(0,168,255,0.30)",
                },
              },
            },
          ],
        }}

        style={{
          width: "100%",
          height: "500px",
        }}

        opts={{
          renderer: "canvas",
        }}
      />
    </div>
  );
}
