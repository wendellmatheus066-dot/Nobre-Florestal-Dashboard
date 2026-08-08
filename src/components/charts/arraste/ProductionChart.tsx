import ReactECharts from "echarts-for-react";
import { useMemo } from "react";
import * as echarts from "echarts";

import { useExcel } from "../../../hooks/useExcel";
import { useFilters } from "../../../context/FilterContext";

import { processDashboardData } from "../../../services/dataProcessor";

export default function ProductionChart() {
  const { data } = useExcel();
  const { filters } = useFilters();

  // Processa os dados sempre que o Excel ou o filtro mudar
  const dashboard = useMemo(() => {
    return processDashboardData(data, filters.arraste);
  }, [data, filters.arraste]);

  const option = useMemo(() => {
    const agrupado = new Map<string, number>();

    // -------------------------------------------------------
    // CONVERTER QUALQUER TIPO DE DATA PARA DD/MM/YYYY
    // -------------------------------------------------------
    const normalizarData = (valor: any): string => {
      if (valor === null || valor === undefined || valor === "") {
        return "";
      }

      // Se já for Date
      if (valor instanceof Date && !isNaN(valor.getTime())) {
        const dia = String(valor.getDate()).padStart(2, "0");
        const mes = String(valor.getMonth() + 1).padStart(2, "0");
        const ano = valor.getFullYear();

        return `${dia}/${mes}/${ano}`;
      }

      const texto = String(valor).trim();

      if (!texto) {
        return "";
      }

      // -----------------------------------------------------
      // DATA DO EXCEL COMO NÚMERO SERIAL
      // Exemplo: 46242
      // -----------------------------------------------------
      if (/^\d{5}(\.\d+)?$/.test(texto)) {
        const numero = Number(texto);

        if (numero > 20000 && numero < 60000) {
          const dataExcel = new Date(
            Date.UTC(1899, 11, 30) + numero * 86400000
          );

          const dia = String(dataExcel.getUTCDate()).padStart(2, "0");
          const mes = String(dataExcel.getUTCMonth() + 1).padStart(2, "0");
          const ano = dataExcel.getUTCFullYear();

          return `${dia}/${mes}/${ano}`;
        }
      }

      // -----------------------------------------------------
      // ISO
      // 2026-08-07
      // 2026-08-07T00:00:00
      // -----------------------------------------------------
      if (/^\d{4}-\d{2}-\d{2}/.test(texto)) {
        const partes = texto.substring(0, 10).split("-");

        if (partes.length === 3) {
          return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
      }

      // -----------------------------------------------------
      // DD/MM/YYYY
      // DD/MM/YY
      // -----------------------------------------------------
      if (texto.includes("/")) {
        const partes = texto.substring(0, 10).split("/");

        if (partes.length === 3) {
          let dia = partes[0].replace(/\D/g, "");
          let mes = partes[1].replace(/\D/g, "");
          let ano = partes[2].replace(/\D/g, "");

          if (dia && mes && ano) {
            dia = dia.padStart(2, "0");
            mes = mes.padStart(2, "0");

            if (ano.length === 2) {
              ano = "20" + ano;
            }

            return `${dia}/${mes}/${ano}`;
          }
        }
      }

      // -----------------------------------------------------
      // TENTA DATA EM TEXTO
      // -----------------------------------------------------
      const tentativa = new Date(texto);

      if (!isNaN(tentativa.getTime())) {
        const dia = String(tentativa.getDate()).padStart(2, "0");
        const mes = String(tentativa.getMonth() + 1).padStart(2, "0");
        const ano = tentativa.getFullYear();

        return `${dia}/${mes}/${ano}`;
      }

      return "";
    };

    // -------------------------------------------------------
    // CONVERTER QUANTIDADE
    // -------------------------------------------------------
    const normalizarQuantidade = (valor: any): number => {
      if (valor === null || valor === undefined || valor === "") {
        return 0;
      }

      // Se já for número, NÃO altera o valor
      if (typeof valor === "number") {
        return isNaN(valor) ? 0 : valor;
      }

      let texto = String(valor).trim();

      if (!texto) {
        return 0;
      }

      // Remove espaços
      texto = texto.replace(/\s/g, "");

      // Caso brasileiro:
      // 1.234,56
      if (texto.includes(",") && texto.includes(".")) {
        texto = texto.replace(/\./g, "");
        texto = texto.replace(",", ".");
      }

      // Caso:
      // 123,45
      else if (texto.includes(",")) {
        texto = texto.replace(",", ".");
      }

      const numero = Number(texto);

      return isNaN(numero) ? 0 : numero;
    };

    // -------------------------------------------------------
    // AGRUPAR PRODUÇÃO POR DATA
    // -------------------------------------------------------
    const linhas = dashboard?.arraste ?? [];

    console.log("=================================");
    console.log("PRODUÇÃO POR DIA - ARRASTE");
    console.log("Quantidade de linhas:", linhas.length);

    if (linhas.length > 0) {
      console.log("Primeira linha:", linhas[0]);
      console.log("Data Patio:", linhas[0]["Data Patio"]);
      console.log("Tipo da Data:", typeof linhas[0]["Data Patio"]);
      console.log("Qtd:", linhas[0]["qtd"]);
    }

    console.log("=================================");

    linhas.forEach((row: any) => {
      if (!row) return;

      // Procura a data principal
      const valorData =
        row["Data Patio"] ??
        row["DATA PATIO"] ??
        row["Data Pátio"] ??
        row["DATA"] ??
        row["Data"];

      const dataPatio = normalizarData(valorData);

      if (!dataPatio) {
        console.warn("Linha sem data:", row);
        return;
      }

      // Procura quantidade
      const valorQuantidade =
        row["qtd"] ??
        row["QTD"] ??
        row["Qtd"] ??
        row["Quantidade"] ??
        row["QUANTIDADE"] ??
        0;

      const quantidade = normalizarQuantidade(valorQuantidade);

      if (quantidade === 0) {
        return;
      }

      agrupado.set(
        dataPatio,
        (agrupado.get(dataPatio) ?? 0) + quantidade
      );
    });

    // -------------------------------------------------------
    // ORDENAR DATAS
    // -------------------------------------------------------
    const dias = [...agrupado.keys()].sort((a, b) => {
      const [diaA, mesA, anoA] = a.split("/").map(Number);
      const [diaB, mesB, anoB] = b.split("/").map(Number);

      const dataA = new Date(
        anoA,
        mesA - 1,
        diaA
      ).getTime();

      const dataB = new Date(
        anoB,
        mesB - 1,
        diaB
      ).getTime();

      return dataA - dataB;
    });

    const valores = dias.map(
      (dia) => agrupado.get(dia) ?? 0
    );

    console.log("Datas do gráfico:", dias);
    console.log("Valores do gráfico:", valores);

    // -------------------------------------------------------
    // CONFIGURAÇÃO DO ECHARTS
    // -------------------------------------------------------
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

        formatter: (params: any) => {
          if (!params || !params.length) {
            return "";
          }

          const item = params[0];

          return `
            <div>
              <strong>${item.axisValue}</strong><br/>
              Produção: ${Number(item.value).toLocaleString(
                "pt-BR"
              )}
            </div>
          `;
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

          rotate: dias.length > 6 ? 30 : 0,

          formatter: (value: string) => value,
        },
      },

      yAxis: {
        type: "value",

        min: 0,

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

          formatter: (value: number) =>
            value.toLocaleString("pt-BR"),
        },
      },

      series: [
        {
          name: "Produção",

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
    <ReactECharts
      option={option}
      style={{
        width: "100%",
        height: 420,
      }}
      notMerge={true}
      lazyUpdate={false}
    />
  );
}