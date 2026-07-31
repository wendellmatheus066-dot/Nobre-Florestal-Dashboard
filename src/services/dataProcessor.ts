import type { DashboardFilters } from "../context/FilterContext";

export interface DashboardIndicators {
  producaoDiaria: number;
  producaoTotal: number;
  media: number;
  operadores: number;
  dias: number;
  especies: number;
}

export interface EstimativaEspecie {
  especie: string;
  arvores: number;
  volumeComercial: number;
  mediaArvore: number;
}

export interface DashboardResult {
  producao: any[];
  geral: any[];
  arraste: any[];
  medicao: any[];
  justificadas: any[];
  restantes: any[];

  estimativaEspecies: EstimativaEspecie[];

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

function getSheet(
  data: Record<string, any[]>,
  name: string
) {
  const key = Object.keys(data).find(
    (k) => normalize(k) === normalize(name)
  );

  return key ? data[key] : [];
}

function findColumn(
  rows: any[],
  aliases: string[]
) {
  if (!rows.length) return null;

  const headers = Object.keys(rows[0]);

  for (const header of headers) {
    const h = normalize(header);

    for (const alias of aliases) {
      const a = normalize(alias);

      if (
        h === a ||
        h.includes(a) ||
        a.includes(h)
      ) {
        return header;
      }
    }
  }

  return null;
}

function toNumber(value: any) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const texto = String(value).trim();

  if (texto.includes(",")) {
    const numero = Number(
      texto
        .replace(/\./g, "")
        .replace(",", ".")
    );

    return isNaN(numero)
      ? 0
      : numero;
  }

  const numero = Number(texto);

  return isNaN(numero)
    ? 0
    : numero;
}

export function processDashboardData(
  data: Record<string, any[]>,
  filters?: DashboardFilters
): DashboardResult {

  const producaoOriginal =
    getSheet(data, "PRODUÇÃO");

  const geral =
    getSheet(data, "GERAL");

  let arraste =
    getSheet(data, "ARRASTE");

  let medicao =
    getSheet(data, "MEDIÇÃO");

  const justificadas =
    getSheet(data, "JUSTIFICADAS");

  const restantes =
    getSheet(data, "RESTANTES");

  const colunaQuantidade =
    findColumn(producaoOriginal, [
      "QUANT.",
      "QUANT",
      "QTD",
      "QUANTIDADE",
      "VOLUME",
      "M3",
    ]);

  const colunaOperador =
    findColumn(producaoOriginal, [
      "MOTOSERRISTA CORTE",
      "OPERADOR",
      "FUNCIONÁRIO",
      "FUNCIONARIO",
    ]);

  const colunaUT =
    findColumn(producaoOriginal, [
      "UT",
    ]);

  const colunaEspecie =
    findColumn(producaoOriginal, [
      "ESPÉCIE",
      "ESPECIE",
    ]);

  const colunaData =
    findColumn(producaoOriginal, [
      "DATA DO CORTE",
      "DATA",
    ]);

  const colunaEspecieMedicao =
    findColumn(medicao, [
      "ESPÉCIE",
      "ESPECIE",
    ]) ?? "Espécie";

  const colunaComercialMedicao =
    findColumn(medicao, [
      "COMERCIAL M3",
      "COMERCIAL",
    ]) ?? "Comercial M3";

  const colunaArvoresMedicao =
    findColumn(medicao, [
      "QTD A",
      "QTDA",
    ]) ?? "qtd a";

  let producao = [
    ...producaoOriginal
  ];

  if (filters) {

    producao =
      producao.filter((row) => {

        if (
          filters.operador &&
          colunaOperador &&
          String(row[colunaOperador]).trim() !==
            filters.operador.trim()
        ) {
          return false;
        }

        if (
          filters.ut &&
          colunaUT &&
          String(row[colunaUT]).trim() !==
            filters.ut.trim()
        ) {
          return false;
        }

        if (
          filters.especie &&
          colunaEspecie &&
          String(row[colunaEspecie]).trim() !==
            filters.especie.trim()
        ) {
          return false;
        }
      if (
  filters.data &&
  colunaData
) {
  const valor = String(
    row[colunaData] ?? ""
  ).trim();

  const partesRegistro = valor.split("/");

  if (partesRegistro.length === 3) {
    const dia = partesRegistro[0].padStart(2, "0");
    const mes = partesRegistro[1].padStart(2, "0");

    let ano = partesRegistro[2];

    if (ano.length === 2) {
      ano = "20" + ano;
    }

    const dataRegistro =
      `${ano}-${mes}-${dia}`;

    if (dataRegistro !== filters.data) {
      return false;
    }
  }
}

        return true;

      });

    const colunaOperadorArraste =
      findColumn(arraste, [
        "SKIDEIRO PATIO",
        "SKIDEIRO",
        "OPERADOR",
      ]);

    const colunaUTArraste =
      findColumn(arraste, [
        "UT",
      ]);

    const colunaEspecieArraste =
      findColumn(arraste, [
        "ESPÉCIE",
        "ESPECIE",
      ]);

    arraste =
      arraste.filter((row) => {

        if (
          filters.operador &&
          colunaOperadorArraste &&
          String(row[colunaOperadorArraste]).trim() !==
            filters.operador.trim()
        ) {
          return false;
        }

        if (
          filters.ut &&
          colunaUTArraste &&
          String(row[colunaUTArraste]).trim() !==
            filters.ut.trim()
        ) {
          return false;
        }

        if (
          filters.especie &&
          colunaEspecieArraste &&
          String(row[colunaEspecieArraste]).trim() !==
            filters.especie.trim()
        ) {
          return false;
        }

        return true;

      });

    const colunaEquipeMedicao =
      findColumn(medicao, [
        "EQUIPE",
      ]) ?? "Equipe";

    const colunaUTMedicao =
      findColumn(medicao, [
        "UT INVENTÁRIO",
        "UT INVENTARIO",
      ]) ?? "UT Inventário";
          medicao =
      medicao.filter((row) => {

        if (
          filters.operador &&
          String(row[colunaEquipeMedicao] ?? "").trim()
          !== filters.operador.trim()
        ) {
          return false;
        }

        if (
          filters.ut &&
          String(row[colunaUTMedicao] ?? "").trim()
          !== filters.ut.trim()
        ) {
          return false;
        }

        if (
          filters.especie &&
          String(row[colunaEspecieMedicao] ?? "").trim()
          !== filters.especie.trim()
        ) {
          return false;
        }

        return true;

      });

  }

  let producaoTotal = 0;

  const operadores =
    new Set<string>();

  const dias =
    new Set<string>();

  const especies =
    new Set<string>();

  const producaoPorData =
    new Map<string, number>();

  for (const row of producao) {

    const quantidade =
      colunaQuantidade
        ? toNumber(row[colunaQuantidade])
        : 0;

    producaoTotal += quantidade;

    if (
      colunaOperador &&
      row[colunaOperador]
    ) {
      operadores.add(
        String(row[colunaOperador]).trim()
      );
    }

    if (
      colunaData &&
      row[colunaData]
    ) {

      const data =
        String(row[colunaData]).trim();

      dias.add(data);

      producaoPorData.set(
        data,
        (producaoPorData.get(data) ?? 0)
        + quantidade
      );

    }

    if (
      colunaEspecie &&
      row[colunaEspecie]
    ) {
      especies.add(
        String(row[colunaEspecie]).trim()
      );
    }

  }

  let producaoDiaria = 0;

  if (producaoPorData.size > 0) {

    const ultimaData =
      [...producaoPorData.keys()]
        .sort()
        .pop();

    if (ultimaData) {
      producaoDiaria =
        producaoPorData.get(ultimaData) ?? 0;
    }

  }

  // ===============================
  // ÁRVORES DERRUBADAS (PRODUÇÃO)
  // ===============================

  const mapaArvores =
    new Map<string, number>();

  for (const row of producao) {

    const especie =
      String(
        row[colunaEspecie ?? ""]
        ?? ""
      ).trim();

    if (!especie) continue;

    const quantidade =
      colunaQuantidade
        ? toNumber(row[colunaQuantidade])
        : 1;

    mapaArvores.set(
      especie,
      (mapaArvores.get(especie) ?? 0)
      + quantidade
    );

  }

  // ===============================
  // MÉDIA DA MEDIÇÃO
  // ===============================

  const mapaMedicao =
    new Map<
      string,
      {
        comercial: number;
        arvoresMedicao: number;
      }
    >();
      for (const row of medicao) {

    const especie =
      String(
        row[colunaEspecieMedicao] ?? ""
      ).trim();

    if (!especie) continue;

    const comercial =
      toNumber(
        row[colunaComercialMedicao]
      );

    const arvoresMedicao =
      toNumber(
        row[colunaArvoresMedicao]
      );

    const atual =
      mapaMedicao.get(especie) ?? {
        comercial: 0,
        arvoresMedicao: 0,
      };

    atual.comercial += comercial;
    atual.arvoresMedicao += arvoresMedicao;

    mapaMedicao.set(
      especie,
      atual
    );

  }

  // ===============================
  // ESTIMATIVA FINAL
  // DERRUBADA × MÉDIA MEDIÇÃO
  // ===============================

  const estimativaEspecies: EstimativaEspecie[] =
    Array.from(mapaArvores.entries())
      .map(([especie, arvores]) => {

        const dados =
          mapaMedicao.get(especie) ?? {
            comercial: 0,
            arvoresMedicao: 0,
          };

        const mediaArvore =
          dados.arvoresMedicao > 0
            ? dados.comercial /
              dados.arvoresMedicao
            : 0;

        return {
          especie,

          // vem da derrubada
          arvores,

          // volume previsto
          volumeComercial:
            arvores * mediaArvore,

          // média da medição
          mediaArvore,
        };

      })
      .sort(
        (a, b) =>
          b.volumeComercial -
          a.volumeComercial
      );

  return {

    producao,

    geral,

    arraste,

    medicao,

    justificadas,

    restantes,

    estimativaEspecies,

    indicadores: {

      producaoDiaria,

      producaoTotal,

      media:
        dias.size > 0
          ? Math.round(
              producaoTotal /
              dias.size
            )
          : 0,

      operadores:
        operadores.size,

      dias:
        dias.size,

      especies:
        especies.size,

    },

  };

}