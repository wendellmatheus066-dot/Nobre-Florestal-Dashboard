import type { DashboardFilters } from "../context/FilterContext";

export interface DashboardIndicators {
  producaoDiaria: number;
  producaoTotal: number;
  media: number;
  operadores: number;
  dias: number;
  especies: number;
}

export interface DashboardResult {
  producao: any[];
  geral: any[];
  arraste: any[];
  medicao: any[];
  justificadas: any[];
  restantes: any[];
  indicadores: DashboardIndicators;
}

function normalize(text: any) {
  return String(text ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getSheet(data: Record<string, any[]>, name: string) {
  const key = Object.keys(data).find(
    (k) => normalize(k) === normalize(name)
  );

  return key ? data[key] : [];
}

function findColumn(rows: any[], aliases: string[]) {
  if (!rows.length) return null;

  const headers = Object.keys(rows[0]);

  for (const header of headers) {
    const h = normalize(header);

    for (const alias of aliases) {
      const a = normalize(alias);

      if (h === a || h.includes(a) || a.includes(h)) {
        return header;
      }
    }
  }

  return null;
}

function toNumber(value: any) {
  if (value == null || value === "") return 0;

  const n = Number(
    String(value)
      .replace(/\./g, "")
      .replace(",", ".")
  );

  return isNaN(n) ? 0 : n;
}

export function processDashboardData(
  data: Record<string, any[]>,
  filters?: DashboardFilters
): DashboardResult {

  const producaoOriginal = getSheet(data, "PRODUÇÃO");

  const geral = getSheet(data, "GERAL");
  let arraste = getSheet(data, "ARRASTE");
  const medicao = getSheet(data, "MEDIÇÃO");
  const justificadas = getSheet(data, "JUSTIFICADAS");
  const restantes = getSheet(data, "RESTANTES");

  const colunaQuantidade = findColumn(producaoOriginal, [
    "QUANT.",
    "QUANT",
    "QTD",
    "QUANTIDADE",
    "VOLUME",
    "M3",
  ]);

  const colunaOperador = findColumn(producaoOriginal, [
    "MOTOSERRISTA CORTE",
    "OPERADOR",
    "FUNCIONÁRIO",
    "FUNCIONARIO",
  ]);

  const colunaData = findColumn(producaoOriginal, [
    "DATA DO CORTE",
    "DATA",
  ]);

  const colunaUT = findColumn(producaoOriginal, [
    "UT",
  ]);

  const colunaEspecie = findColumn(producaoOriginal, [
    "ESPÉCIE",
    "ESPECIE",
  ]);

  let producao = producaoOriginal;

  if (filters) {

    producao = producaoOriginal.filter((row) => {

      if (
        filters.operador &&
        colunaOperador &&
        String(row[colunaOperador]) !== filters.operador
      ) {
        return false;
      }

      if (
        filters.ut &&
        colunaUT &&
        String(row[colunaUT]) !== filters.ut
      ) {
        return false;
      }

      if (
        filters.especie &&
        colunaEspecie &&
        String(row[colunaEspecie]) !== filters.especie
      ) {
        return false;
      }

      if (filters.data && colunaData) {

        const valorData = String(row[colunaData]).trim();

        const [ano, mes, dia] = filters.data.split("-");

        const dataFiltro = `${dia}/${mes}/${ano}`;

        if (valorData !== dataFiltro) {
          return false;
        }
      }

      return true;
    });
        const colunaOperadorArraste = findColumn(arraste, [
      "SKIDEIRO PATIO",
      "SKIDEIRO",
      "OPERADOR",
    ]);

    const colunaDataArraste = findColumn(arraste, [
      "DATA PATIO",
      "DATA",
    ]);

    const colunaUTArraste = findColumn(arraste, [
      "UT",
    ]);

    const colunaEspecieArraste = findColumn(arraste, [
      "ESPÉCIE",
      "ESPECIE",
    ]);

    arraste = arraste.filter((row) => {

      if (
        filters.operador &&
        colunaOperadorArraste &&
        String(row[colunaOperadorArraste]) !== filters.operador
      ) {
        return false;
      }

      if (
        filters.ut &&
        colunaUTArraste &&
        String(row[colunaUTArraste]) !== filters.ut
      ) {
        return false;
      }

      if (
        filters.especie &&
        colunaEspecieArraste &&
        String(row[colunaEspecieArraste]) !== filters.especie
      ) {
        return false;
      }

      if (filters.data && colunaDataArraste) {

        const valorData = String(row[colunaDataArraste]).trim();

        const [ano, mes, dia] = filters.data.split("-");

        const dataFiltro = `${dia}/${mes}/${ano}`;

        if (valorData !== dataFiltro) {
          return false;
        }
      }

      return true;
    });

  }

  let producaoTotal = 0;

  const operadores = new Set<string>();
  const dias = new Set<string>();
  const especies = new Set<string>();

  const producaoPorData = new Map<string, number>();

  for (const row of producao) {

    const quantidade = colunaQuantidade
      ? toNumber(row[colunaQuantidade])
      : 0;

    producaoTotal += quantidade;

    if (colunaOperador && row[colunaOperador]) {
      operadores.add(String(row[colunaOperador]).trim());
    }

    if (colunaData && row[colunaData]) {

      const data = String(row[colunaData]).trim();

      dias.add(data);

      producaoPorData.set(
        data,
        (producaoPorData.get(data) ?? 0) + quantidade
      );
    }

    if (colunaEspecie && row[colunaEspecie]) {
      especies.add(String(row[colunaEspecie]).trim());
    }
  }

  let producaoDiaria = 0;

  if (producaoPorData.size > 0) {

    const ultimaData = [...producaoPorData.keys()]
      .sort()
      .pop()!;

    producaoDiaria = producaoPorData.get(ultimaData) ?? 0;
  }
    return {
    producao,
    geral,
    arraste,
    medicao,
    justificadas,
    restantes,

    indicadores: {
      producaoDiaria,
      producaoTotal,

      media:
        dias.size > 0
          ? Math.round(producaoTotal / dias.size)
          : 0,

      operadores: operadores.size,

      dias: dias.size,

      especies: especies.size,
    },
  };
}