import type { DashboardFilters } from "../context/FilterContext";

// ==========================================
// TIPOS
// ==========================================

export interface DashboardIndicators {
  producaoDiaria: number;
  producaoTotal: number;
  media: number;
  operadores: number;
  dias: number;
  especies: number;
  arvores: number;
}

export interface EstimativaEspecie {
  especie: string;
  arvores: number;
  arvoresMedidas: number;
  volumeComercial: number;
  volumeFlorestal: number;
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

  indicadoresArraste: {
    total: number;
    media: number;
    dias: number;
  };
}

// ==========================================
// NORMALIZA TEXTO
// ==========================================

function normalize(text: any) {
  return String(text ?? "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ==========================================
// LOCALIZA PLANILHA
// ==========================================

function getSheet(
  data: Record<string, any[]>,
  name: string
) {
  const key = Object.keys(data).find(
    (k) => normalize(k) === normalize(name)
  );

  return key ? data[key] : [];
}

// ==========================================
// LOCALIZA COLUNA
// ==========================================

function findColumn(
  rows: any[],
  aliases: string[]
) {
  if (!rows.length) {
    return null;
  }

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

// ==========================================
// CONVERTE NÚMERO
// ==========================================

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

    return isNaN(numero) ? 0 : numero;
  }

  const numero = Number(texto);

  return isNaN(numero) ? 0 : numero;
}

// ==========================================
// CONVERTE DATA PARA O PADRÃO DO FILTRO
// ==========================================

function normalizarData(valor: any): string {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return "";
  }

  const texto = String(valor).trim();

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(texto)
  ) {
    return texto;
  }

  if (texto.includes("/")) {
    const partes = texto.split("/");

    if (partes.length !== 3) {
      return "";
    }

    const primeiro = Number(partes[0]);
    const segundo = Number(partes[1]);

    let ano = partes[2];

    if (
      isNaN(primeiro) ||
      isNaN(segundo) ||
      isNaN(Number(ano))
    ) {
      return "";
    }

    if (ano.length === 2) {
      ano = "20" + ano;
    }

    let mes: number;
    let dia: number;

    if (primeiro > 12) {
      dia = primeiro;
      mes = segundo;
    } else if (segundo > 12) {
      mes = primeiro;
      dia = segundo;
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
      `${String(mes).padStart(2, "0")}-` +
      `${String(dia).padStart(2, "0")}`
    );
  }

  return "";
}

// ==========================================
// COMPARA DATA
// ==========================================

function correspondeData(
  valor: any,
  filtro: string
) {
  if (!filtro) {
    return true;
  }

  const dataNormalizada =
    normalizarData(valor);

  return dataNormalizada === filtro;
}

// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================

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

  let arv =
    getSheet(data, "MEDIÇÃO");

  const restantes =
    getSheet(data, "RESTANTES");

  // ========================================
  // COLUNAS DA PRODUÇÃO
  // ========================================

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

  // ========================================
  // COLUNAS DA MEDIÇÃO
  // ========================================

  const colunaEspecieMedicao =
    findColumn(medicao, [
      "ESPÉCIE",
      "ESPECIE",
    ]) ?? "Espécie";

  const colunaNumeroArvoreArv =
    findColumn(medicao, [
      "Nº ÁRVORE",
      "NO ÁRVORE",
      "Nº ARVORE",
      "NO ARVORE",
      "NUMERO ARVORE",
      "NÚMERO ÁRVORE",
    ]) ?? "Nº ÁRVORE";

  const colunaComercialMedicao =
    findColumn(medicao, [
      "COMERCIAL M3",
      "COMERCIAL",
    ]) ?? "Comercial M3";

  const colunaFlorestalMedicao =
    findColumn(medicao, [
      "FLORESTAL M3",
      "FLORESTAL",
    ]) ?? "Florestal M3";

  // ========================================
  // COLUNAS DA ARV
  // ========================================

  const colunaEspecieArv =
    findColumn(arv, [
      "ESPÉCIE",
      "ESPECIE",
    ]) ?? "Espécie";

  const colunaEquipeArv =
    findColumn(arv, [
      "EQUIPE",
    ]) ?? "Equipe";

  const colunaUTArv =
    findColumn(arv, [
      "UT INVENTÁRIO",
      "UT INVENTARIO",
      "UT",
    ]) ?? "UT Inventário";

  const colunaDataArv =
    findColumn(arv, [
      "DATA PATIO",
      "DATA PÁTIO",
      "DATA",
    ]);

  // ========================================
  // COLUNAS DO ARRASTE
  // ========================================

  const colunaQuantidadeArraste =
    findColumn(arraste, [
      "QTD",
      "QUANT.",
      "QUANT",
      "QUANTIDADE",
      "VOLUME",
      "ARVORES",
      "ÁRVORES",
    ]);

  const colunaOperadorArraste =
    findColumn(arraste, [
      "SKIDEIRO PATIO",
      "SKIDEIRO PÁTIO",
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

  const colunaDataArraste =
    findColumn(arraste, [
      "DATA PATIO",
      "DATA PÁTIO",
      "DATA",
    ]);

  console.log(
    "COLUNA DATA ARRASTE:",
    colunaDataArraste
  );

  console.log(
    "COLUNA QUANTIDADE ARRASTE:",
    colunaQuantidadeArraste
  );

  // ========================================
  // CÓPIA DA PRODUÇÃO
  // ========================================

  let producao = [
    ...producaoOriginal,
  ];

  // ========================================
  // FILTRO PRINCIPAL
  // ========================================

  if (filters) {

    // ======================================
    // PRODUÇÃO
    // ======================================

    producao = producao.filter((row) => {

      if (
        filters.operador &&
        colunaOperador &&
        String(
          row[colunaOperador] ?? ""
        ).trim() !==
          filters.operador.trim()
      ) {
        return false;
      }

      if (
        filters.ut &&
        colunaUT &&
        String(
          row[colunaUT] ?? ""
        ).trim() !==
          filters.ut.trim()
      ) {
        return false;
      }

      if (
        filters.especie &&
        colunaEspecie &&
        String(
          row[colunaEspecie] ?? ""
        ).trim() !==
          filters.especie.trim()
      ) {
        return false;
      }

      if (
        filters.data &&
        colunaData
      ) {
        if (
          !correspondeData(
            row[colunaData],
            filters.data
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // ======================================
    // FILTRO ARRASTE
    // ======================================

    arraste = arraste.filter((row) => {

      if (
        filters.operador &&
        colunaOperadorArraste &&
        String(
          row[
            colunaOperadorArraste
          ] ?? ""
        ).trim() !==
          filters.operador.trim()
      ) {
        return false;
      }

      if (
        filters.ut &&
        colunaUTArraste &&
        String(
          row[
            colunaUTArraste
          ] ?? ""
        ).trim() !==
          filters.ut.trim()
      ) {
        return false;
      }

      if (
        filters.especie &&
        colunaEspecieArraste &&
        String(
          row[
            colunaEspecieArraste
          ] ?? ""
        ).trim() !==
          filters.especie.trim()
      ) {
        return false;
      }

      if (
        filters.data &&
        colunaDataArraste
      ) {
        if (
          !correspondeData(
            row[
              colunaDataArraste
            ],
            filters.data
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // ======================================
    // COLUNAS DA MEDIÇÃO
    // ======================================

    const colunaEquipeMedicao =
      findColumn(medicao, [
        "EQUIPE",
      ]) ?? "Equipe";

    const colunaUTMedicao =
      findColumn(medicao, [
        "UT INVENTÁRIO",
        "UT INVENTARIO",
      ]) ?? "UT Inventário";

    const colunaDataMedicao =
      findColumn(medicao, [
        "DATA",
        "DATA PATIO",
        "DATA PÁTIO",
      ]);

    console.log(
      "COLUNA DATA MEDIÇÃO:",
      colunaDataMedicao
    );

    // ======================================
    // FILTRO MEDIÇÃO
    // ======================================

    medicao = medicao.filter((row) => {

      if (
        filters.operador &&
        String(
          row[
            colunaEquipeMedicao
          ] ?? ""
        ).trim() !==
          filters.operador.trim()
      ) {
        return false;
      }

      if (
        filters.ut &&
        String(
          row[
            colunaUTMedicao
          ] ?? ""
        ).trim() !==
          filters.ut.trim()
      ) {
        return false;
      }

      if (
        filters.especie &&
        String(
          row[
            colunaEspecieMedicao
          ] ?? ""
        ).trim() !==
          filters.especie.trim()
      ) {
        return false;
      }

      if (
        filters.data &&
        colunaDataMedicao
      ) {
        if (
          !correspondeData(
            row[
              colunaDataMedicao
            ],
            filters.data
          )
        ) {
          return false;
        }
      }

      return true;
    });

    // ======================================
    // FILTRO ARV
    // ======================================

    arv = arv.filter((row) => {

      if (
        filters.operador &&
        colunaEquipeArv &&
        String(
          row[colunaEquipeArv] ?? ""
        ).trim() !==
          filters.operador.trim()
      ) {
        return false;
      }

      if (
        filters.ut &&
        colunaUTArv &&
        String(
          row[colunaUTArv] ?? ""
        ).trim() !==
          filters.ut.trim()
      ) {
        return false;
      }

      if (
        filters.especie &&
        colunaEspecieArv &&
        String(
          row[colunaEspecieArv] ?? ""
        ).trim() !==
          filters.especie.trim()
      ) {
        return false;
      }

      if (
        filters.data &&
        colunaDataArv
      ) {
        if (
          !correspondeData(
            row[colunaDataArv],
            filters.data
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }

  // ==========================================
  // INDICADORES
  // ==========================================

  let producaoTotal = 0;

  const operadores =
    new Set<string>();

  const dias =
    new Set<string>();

  const especies =
    new Set<string>();

  const producaoPorData =
    new Map<string, number>();

  // ==========================================
  // PROCESSA PRODUÇÃO
  // ==========================================

  for (
    const row of producao
  ) {

    const quantidade =
      colunaQuantidade
        ? toNumber(
            row[
              colunaQuantidade
            ]
          )
        : 0;

    producaoTotal +=
      quantidade;

    if (
      colunaOperador &&
      row[colunaOperador]
    ) {
      operadores.add(
        String(
          row[colunaOperador]
        ).trim()
      );
    }

    if (
      colunaData &&
      row[colunaData]
    ) {
      const dataOriginal =
        String(
          row[colunaData]
        ).trim();

      const dataNormalizada =
        normalizarData(
          dataOriginal
        );

      if (dataNormalizada) {

        dias.add(
          dataNormalizada
        );

        producaoPorData.set(
          dataNormalizada,
          (
            producaoPorData.get(
              dataNormalizada
            ) ?? 0
          ) + quantidade
        );
      }
    }

    if (
      colunaEspecie &&
      row[colunaEspecie]
    ) {
      especies.add(
        String(
          row[colunaEspecie]
        ).trim()
      );
    }
  }

  // ==========================================
  // INDICADORES DO ARRASTE
  // ==========================================

  const diasArraste =
    new Set<string>();

  const producaoArrastePorData =
    new Map<string, number>();

  let totalArraste = 0;

  for (const row of arraste) {

    if (!row) {
      continue;
    }

    const valorData =
      colunaDataArraste
        ? row[colunaDataArraste]
        : row["Data Patio"];

    const dataNormalizada =
      normalizarData(valorData);

    if (!dataNormalizada) {
      continue;
    }

    const quantidade =
      colunaQuantidadeArraste
        ? toNumber(
            row[colunaQuantidadeArraste]
          )
        : 0;

    totalArraste += quantidade;

    diasArraste.add(
      dataNormalizada
    );

    producaoArrastePorData.set(
      dataNormalizada,
      (
        producaoArrastePorData.get(
          dataNormalizada
        ) ?? 0
      ) + quantidade
    );
  }

  const mediaArraste =
    diasArraste.size > 0
      ? Math.round(
          totalArraste /
          diasArraste.size
        )
      : 0;

  console.log(
    "================================="
  );

  console.log(
    "INDICADORES ARRASTE"
  );

  console.log(
    "Total Arraste:",
    totalArraste
  );

  console.log(
    "Dias Arraste:",
    diasArraste.size
  );

  console.log(
    "Média Arraste:",
    mediaArraste
  );

  console.log(
    "================================="
  );

  // ==========================================
  // PRODUÇÃO DIÁRIA
  // ==========================================

  let producaoDiaria = 0;

  if (
    producaoPorData.size > 0
  ) {

    const datasOrdenadas =
      [
        ...producaoPorData.keys(),
      ].sort();

    const ultimaData =
      datasOrdenadas[
        datasOrdenadas.length - 1
      ];

    if (ultimaData) {
      producaoDiaria =
        producaoPorData.get(
          ultimaData
        ) ?? 0;
    }
  }

  // ==========================================
  // ÁRVORES DERRUBADAS
  // ==========================================

  const mapaArvores =
    new Map<string, number>();

  for (
    const row of producao
  ) {

    const especie =
      String(
        row[
          colunaEspecie ?? ""
        ] ?? ""
      ).trim();

    if (!especie) {
      continue;
    }

    const quantidade =
      colunaQuantidade
        ? toNumber(
            row[
              colunaQuantidade
            ]
          )
        : 1;

    mapaArvores.set(
      especie,
      (
        mapaArvores.get(
          especie
        ) ?? 0
      ) + quantidade
    );
  }

  // ==========================================
  // MEDIÇÃO
  // ==========================================

  const mapaMedicao =
    new Map<
      string,
      {
        comercial: number;
        florestal: number;
        arvoresMedicao: number;
      }
    >();

  for (
    const row of medicao
  ) {

    const especie =
      String(
        row[
          colunaEspecieMedicao
        ] ?? ""
      ).trim();

    if (!especie) {
      continue;
    }

    const comercial =
      toNumber(
        row[
          colunaComercialMedicao
        ]
      );

    const florestal =
      toNumber(
        row[
          colunaFlorestalMedicao
        ]
      );

    const atual =
      mapaMedicao.get(
        especie
      ) ?? {
        comercial: 0,
        florestal: 0,
        arvoresMedicao: 0,
      };

    atual.comercial +=
      comercial;

    atual.florestal +=
      florestal;

    mapaMedicao.set(
      especie,
      atual
    );
  }

  // ==========================================
  // ÁRVORES MEDIDAS
  // ==========================================
  //
  // REGRA:
  // Cada Nº ÁRVORE diferente na aba MEDIÇÃO
  // representa uma árvore medida.
  //
  // Não usamos "qtd a".
  // Não contamos linhas.
  // Não contamos toras repetidas.
  //
  // Se a mesma árvore aparecer várias vezes,
  // ela continua sendo apenas 1 árvore medida.
  // ==========================================

  const mapaArvoresMedidas =
    new Map<string, Set<string>>();

  for (const row of medicao) {

    const especie =
      String(
        row[
          colunaEspecieMedicao
        ] ?? ""
      ).trim();

    const numeroArvore =
      String(
        row[
          colunaNumeroArvoreArv
        ] ?? ""
      ).trim();

    if (
      !especie ||
      !numeroArvore
    ) {
      continue;
    }

    if (
      !mapaArvoresMedidas.has(
        especie
      )
    ) {
      mapaArvoresMedidas.set(
        especie,
        new Set<string>()
      );
    }

    mapaArvoresMedidas
      .get(especie)!
      .add(numeroArvore);
  }

  // ==========================================
  // ESTIMATIVA POR ESPÉCIE
  // ==========================================

  const estimativaEspecies:
    EstimativaEspecie[] =
    Array.from(
      mapaArvores.entries()
    )
      .map(
        ([
          especie,
          arvores,
        ]) => {

          const dados =
            mapaMedicao.get(
              especie
            ) ?? {
              comercial: 0,
              florestal: 0,
              arvoresMedicao: 0,
            };

          // Número de árvores únicas medidas
          const arvoresMedidasArv =
            mapaArvoresMedidas.get(
              especie
            )?.size ?? 0;

          // Média de volume comercial
          // por árvore realmente medida.
          const mediaArvore =
            arvoresMedidasArv > 0
              ? dados.comercial /
                arvoresMedidasArv
              : 0;

          return {
            especie,

            arvores,

            arvoresMedidas:
              arvoresMedidasArv,

            volumeComercial:
              dados.comercial,

            volumeFlorestal:
              dados.florestal,

            mediaArvore,
          };
        }
      )
      .sort(
        (a, b) =>
          b.volumeComercial -
          a.volumeComercial
      );

  // ==========================================
  // TOTAL VOLUME COMERCIAL
  // ==========================================

  const volumeComercialTotal =
    estimativaEspecies.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.volumeComercial ?? 0
        ),
      0
    );

  // ==========================================
  // TOTAL VOLUME FLORESTAL
  // ==========================================

  const volumeFlorestalTotal =
    estimativaEspecies.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.volumeFlorestal ?? 0
        ),
      0
    );

  // ==========================================
  // TOTAL ÁRVORES MEDIDAS
  // ==========================================

  const arvoresMedidasTotal =
    estimativaEspecies.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.arvoresMedidas ?? 0
        ),
      0
    );

  // ==========================================
  // LOGS DE CONFERÊNCIA
  // ==========================================

  console.log(
    "================================="
  );

  console.log(
    "DASHBOARD PROCESSADO"
  );

  console.log(
    "Produção:",
    producao.length
  );

  console.log(
    "Arraste:",
    arraste.length
  );

  console.log(
    "Medição:",
    medicao.length
  );

  console.log(
    "Produção total:",
    producaoTotal
  );

  console.log(
    "Volume comercial:",
    volumeComercialTotal
  );

  console.log(
    "Volume florestal:",
    volumeFlorestalTotal
  );

  console.log(
    "Árvores medidas:",
    arvoresMedidasTotal
  );

  console.log(
    "================================="
  );

  // ==========================================
  // RETORNO FINAL
  // ==========================================

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

      arvores:
        estimativaEspecies.reduce(
          (total, item) =>
            total +
            Number(item.arvores ?? 0),
          0
        ),
    },

    indicadoresArraste: {
      total: totalArraste,

      media: mediaArraste,

      dias: diasArraste.size,
    },
  };
}