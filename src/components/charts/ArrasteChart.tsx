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
  } else if (
    texto.includes(",")
  ) {
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero)
    ? numero
    : 0;
}

function normalizarData(valor: any): string {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return "";
  }

  if (
    valor instanceof Date &&
    !isNaN(valor.getTime())
  ) {
    return (
      `${valor.getFullYear()}-` +
      `${String(
        valor.getMonth() + 1
      ).padStart(2, "0")}-` +
      `${String(
        valor.getDate()
      ).padStart(2, "0")}`
    );
  }

  const texto = String(valor).trim();

  const iso = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  if (
    /^\d+(?:\.\d+)?$/.test(texto)
  ) {
    const serial = Number(texto);

    if (
      serial > 20000 &&
      serial < 80000
    ) {
      const data = new Date(
        Date.UTC(
          1899,
          11,
          30
        ) +
          serial *
            86400000
      );

      return (
        `${data.getUTCFullYear()}-` +
        `${String(
          data.getUTCMonth() + 1
        ).padStart(2, "0")}-` +
        `${String(
          data.getUTCDate()
        ).padStart(2, "0")}`
      );
    }
  }

  if (texto.includes("/")) {
    const partes = texto.split("/");

    if (partes.length !== 3) {
      return "";
    }

    const primeiro = Number(
      partes[0]
    );

    const segundo = Number(
      partes[1]
    );

    let ano = String(
      partes[2]
    ).replace(/\s.*/, "");

    if (
      !Number.isFinite(primeiro) ||
      !Number.isFinite(segundo) ||
      !Number.isFinite(Number(ano))
    ) {
      return "";
    }

    if (ano.length === 2) {
      ano = `20${ano}`;
    }

    let dia: number;
    let mes: number;

    /*
     * Dados atuais do arquivo:
     * 09/01/2026 = 01/09/2026
     * 09/02/2026 = 02/09/2026
     */
    if (primeiro > 12) {
      dia = primeiro;
      mes = segundo;
    } else if (segundo > 12) {
      dia = segundo;
      mes = primeiro;
    } else {
      mes = primeiro;
      dia = segundo;
    }

    if (
      mes < 1 ||
      mes > 12 ||
      dia < 1 ||
      dia > 31
    ) {
      return "";
    }

    return (
      `${ano}-` +
      `${String(
        mes
      ).padStart(2, "0")}-` +
      `${String(
        dia
      ).padStart(2, "0")}`
    );
  }

  return "";
}

function formatarDataBr(
  dataIso: string
): string {
  const partes =
    dataIso.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

  if (!partes) {
    return dataIso;
  }

  return (
    `${partes[3]}/${partes[2]}/${partes[1]}`
  );
}

export default function ArrasteChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard =
    processDashboardData(
      data,
      filters.arraste
    );

  const pontos =
    useMemo(() => {
      const porData =
        new Map<string, number>();

      for (
        const row of dashboard.arraste
      ) {
        const dataNormalizada =
          normalizarData(
            row["Data Patio"] ??
            row["Data Pátio"] ??
            row["DATA"] ??
            row["Data"]
          );

        if (!dataNormalizada) {
          continue;
        }

        const quantidade =
          converterNumero(
            row["qtd"] ??
            row["QTD"] ??
            row["Qtd"] ??
            row["QUANT."] ??
            row["QUANTIDADE"] ??
            0
          );

        porData.set(
          dataNormalizada,
          (
            porData.get(
              dataNormalizada
            ) ?? 0
          ) + quantidade
        );
      }

      return Array.from(
        porData.entries()
      )
        .sort(
          ([a], [b]) =>
            a.localeCompare(b)
        )
        .map(
          ([data, quantidade]) => ({
            data,
            label:
              formatarDataBr(data),
            quantidade,
          })
        );
    }, [dashboard.arraste]);

  if (pontos.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-sm font-semibold text-[#7F87A8]">
        Nenhum dado de arraste encontrado.
      </div>
    );
  }

  return (
    <ReactECharts
      option={{
        animation: true,
        animationDuration: 700,

        grid: {
          left: 56,
          right: 24,
          top: 24,
          bottom: 82,
          containLabel: true,
        },

        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
          },
          backgroundColor: "#21222C",
          borderColor: "#44475A",
          textStyle: {
            color: "#FFFFFF",
            fontWeight: 700,
          },
          formatter: (
            params: any[]
          ) => {
            const p =
              params?.[0];

            return [
              `<b>${p?.name ?? ""}</b>`,
              `Arraste: <b>${Number(
                p?.value ?? 0
              ).toLocaleString(
                "pt-BR"
              )}</b> árvores`,
            ].join("<br/>");
          },
        },

        xAxis: {
          type: "category",

          data: pontos.map(
            (item) =>
              item.label
          ),

          boundaryGap: false,

          axisLabel: {
            color: "#BDC1D6",
            fontSize: 10,
            fontWeight: 700,
            interval: "auto",
            rotate: 30,
          },

          axisLine: {
            lineStyle: {
              color: "#4A5168",
            },
          },

          axisTick: {
            show: false,
          },
        },

        yAxis: {
          type: "value",

          axisLabel: {
            color: "#7F87A8",
            fontSize: 10,
            fontWeight: 700,
          },

          splitLine: {
            lineStyle: {
              color:
                "rgba(255,255,255,0.055)",
            },
          },

          axisLine: {
            show: false,
          },
        },

        series: [
          {
            name: "Arraste",
            type: "line",
            smooth: true,

            data: pontos.map(
              (item) =>
                item.quantidade
            ),

            symbol: "circle",
            symbolSize: 7,
            showSymbol: true,

            lineStyle: {
              width: 4,
              color: "#FF7A00",
            },

            itemStyle: {
              color: "#FF7A00",
              borderColor: "#21222C",
              borderWidth: 2,
            },

            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,

                colorStops: [
                  {
                    offset: 0,
                    color:
                      "rgba(255,122,0,0.25)",
                  },
                  {
                    offset: 1,
                    color:
                      "rgba(255,122,0,0.03)",
                  },
                ],
              },
            },

            emphasis: {
              focus: "series",

              itemStyle: {
                shadowBlur: 14,
                shadowColor:
                  "rgba(255,122,0,0.35)",
              },
            },
          },
        ],
      }}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "360px",
      }}
      opts={{
        renderer: "canvas",
      }}
    />
  );
}
