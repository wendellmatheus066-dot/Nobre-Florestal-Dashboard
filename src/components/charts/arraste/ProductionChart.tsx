import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";
import { processDashboardData } from "../../../services/dataProcessor";

function converterNumero(valor: any): number {
  if (
    valor === undefined ||
    valor === null ||
    valor === ""
  ) {
    return 0;
  }

  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : 0;
  }

  let texto = String(valor)
    .trim()
    .replace(/\s/g, "");

  if (texto.includes(".") && texto.includes(",")) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");
  } else if (texto.includes(",")) {
    texto = texto.replace(",", ".");
  }

  const numero = Number(texto);

  return Number.isFinite(numero) ? numero : 0;
}

/*
 * Os dados atuais do Arraste estão vindo neste padrão:
 *
 * 09/01/2026 -> 01/09/2026
 * 09/02/2026 -> 02/09/2026
 *
 * Por isso, quando as duas partes são <= 12,
 * interpretamos como MM/DD/YYYY.
 */
function normalizarDataArraste(valor: any): string {
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
    return [
      valor.getFullYear(),
      String(valor.getMonth() + 1).padStart(2, "0"),
      String(valor.getDate()).padStart(2, "0"),
    ].join("-");
  }

  const texto = String(valor).trim();

  const iso = texto.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`;
  }

  // Serial Excel
  if (/^\d+(?:\.\d+)?$/.test(texto)) {
    const serial = Number(texto);

    if (serial > 20000 && serial < 80000) {
      const data = new Date(
        Date.UTC(1899, 11, 30) +
          serial * 86400000
      );

      return [
        data.getUTCFullYear(),
        String(data.getUTCMonth() + 1).padStart(2, "0"),
        String(data.getUTCDate()).padStart(2, "0"),
      ].join("-");
    }
  }

  if (texto.includes("/")) {
    const partes = texto.split("/");

    if (partes.length !== 3) {
      return "";
    }

    const a = Number(partes[0]);
    const b = Number(partes[1]);

    let ano = String(partes[2]).replace(/\s.*/, "");

    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isFinite(Number(ano))
    ) {
      return "";
    }

    if (ano.length === 2) {
      ano = `20${ano}`;
    }

    let dia: number;
    let mes: number;

    if (a > 12) {
      // 31/08/2026 -> 31/08/2026
      dia = a;
      mes = b;
    } else if (b > 12) {
      // 08/31/2026 -> 31/08/2026
      dia = b;
      mes = a;
    } else {
      // Dados atuais do Arraste: MM/DD/YYYY
      // 09/01/2026 -> 01/09/2026
      // 09/02/2026 -> 02/09/2026
      mes = a;
      dia = b;
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
      `${String(mes).padStart(2, "0")}-` +
      `${String(dia).padStart(2, "0")}`
    );
  }

  return "";
}

function formatarDataBr(dataIso: string): string {
  const partes = dataIso.match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!partes) {
    return dataIso;
  }

  return `${partes[3]}/${partes[2]}/${partes[1]}`;
}

export default function ProductionChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  const dashboard = processDashboardData(
    data,
    filters.arraste
  );

  const pontos = useMemo(() => {
    const porData = new Map<string, number>();

    for (const row of dashboard.arraste) {
      const data = normalizarDataArraste(
        row["Data Patio"] ??
        row["Data Pátio"] ??
        row["DATA PATIO"] ??
        row["DATA PÁTIO"] ??
        row["Data"] ??
        row["DATA"]
      );

      if (!data) {
        continue;
      }

      const quantidade = converterNumero(
        row["qtd"] ??
        row["QTD"] ??
        row["Qtd"] ??
        row["QUANT."] ??
        row["QUANT"] ??
        row["QUANTIDADE"] ??
        0
      );

      porData.set(
        data,
        (porData.get(data) ?? 0) +
          quantidade
      );
    }

    return Array.from(porData.entries())
      .sort(
        ([dataA], [dataB]) =>
          dataA.localeCompare(dataB)
      )
      .map(
        ([data, quantidade]) => ({
          data,
          label: formatarDataBr(data),
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
        animationDuration: 600,

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
          borderColor: "#00D084",
          textStyle: {
            color: "#FFFFFF",
            fontWeight: 700,
          },
          formatter: (params: any[]) => {
            const p = params?.[0];

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
            (item) => item.label
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
              color: "rgba(255,255,255,0.055)",
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
              (item) => item.quantidade
            ),

            symbol: "circle",
            symbolSize: 7,
            showSymbol: true,

            lineStyle: {
              width: 4,
              color: "#00D084",
            },

            itemStyle: {
              color: "#00D084",
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
                    color: "rgba(0,208,132,0.25)",
                  },
                  {
                    offset: 1,
                    color: "rgba(0,208,132,0.03)",
                  },
                ],
              },
            },

            emphasis: {
              focus: "series",

              itemStyle: {
                shadowBlur: 14,
                shadowColor:
                  "rgba(0,208,132,0.35)",
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
