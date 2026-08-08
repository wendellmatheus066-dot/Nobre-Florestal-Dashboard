export interface MedicaoStats {
  volumeFlorestal: number;
  volumeComercial: number;
  arvores: number;
  especies: number;
  dias: number;
  uts: number;
  mediaEquipe: number;
}

// ==========================================
// NORMALIZAR DATA
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

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
    return texto;
  }

  // Datas com /
  if (texto.includes("/")) {
    const partes = texto.split("/");

    if (partes.length !== 3) {
      return "";
    }

    const primeiro = Number(partes[0]);
    const segundo = Number(partes[1]);

    let ano = String(partes[2]);

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

    // DD/MM/YYYY
    if (primeiro > 12) {
      dia = primeiro;
      mes = segundo;
    }

    // MM/DD/YYYY
    else if (segundo > 12) {
      mes = primeiro;
      dia = segundo;
    }

    // Padrão dos dados atuais
    else {
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
// CONVERTER NÚMEROS
// ==========================================

function converterNumero(valor: any): number {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return 0;
  }

  // Se já for número, mantém
  if (typeof valor === "number") {
    return isNaN(valor) ? 0 : valor;
  }

  let texto = String(valor).trim();

  if (!texto) {
    return 0;
  }

  texto = texto.replace(/\s/g, "");

  // Exemplo: 1.847,62
  if (
    texto.includes(".") &&
    texto.includes(",")
  ) {
    texto = texto
      .replace(/\./g, "")
      .replace(",", ".");

    const numero = Number(texto);

    return isNaN(numero)
      ? 0
      : numero;
  }

  // Exemplo: 1847,62
  if (texto.includes(",")) {
    texto = texto.replace(",", ".");

    const numero = Number(texto);

    return isNaN(numero)
      ? 0
      : numero;
  }

  // Exemplo: 1847.62
  const numero = Number(texto);

  return isNaN(numero)
    ? 0
    : numero;
}

// ==========================================
// PROCESSAR MEDIÇÃO
// ==========================================

export function processarMedicao(
  medicao: any[]
) {
  console.log(
    "Primeira linha da medição:",
    medicao[0]
  );

  return medicao.map((row) => {

    const volumeFlorestal =
      converterNumero(
        row["Florestal M3"]
      );

    const volumeComercial =
      converterNumero(
        row["Comercial M3"]
      );

    const arvores =
      converterNumero(
        row["qtd a"]
      );

    const dataOriginal =
      row["Data"] ??
      row["DATA"] ??
      row["Data Patio"] ??
      row["Data Pátio"] ??
      "";

    const data =
      normalizarData(
        dataOriginal
      );

    return {
      especie:
        row["Espécie"] ??
        row["ESPÉCIE"] ??
        "",

      volumeFlorestal,

      volumeComercial,

      arvores,

      data,

      ut:
        row["UT Inventário"] ??
        row["UT INVENTÁRIO"] ??
        "",

      equipe:
        row["Equipe"] ??
        row["EQUIPE"] ??
        "",
    };
  });
}

// ==========================================
// CALCULAR ESTATÍSTICAS
// ==========================================

export function calcularStatsMedicao(
  registros: any[]
): MedicaoStats {

  let volumeFlorestal = 0;

  let volumeComercial = 0;

  let arvores = 0;

  const especies =
    new Set<string>();

  const dias =
    new Set<string>();

  const uts =
    new Set<string>();

  const equipes =
    new Set<string>();

  registros.forEach((row) => {

    volumeFlorestal +=
      Number(
        row.volumeFlorestal ?? 0
      );

    volumeComercial +=
      Number(
        row.volumeComercial ?? 0
      );

    arvores +=
      Number(
        row.arvores ?? 0
      );

    if (row.especie) {
      especies.add(
        String(row.especie).trim()
      );
    }

    if (row.data) {

      const dataNormalizada =
        normalizarData(
          row.data
        );

      if (dataNormalizada) {
        dias.add(
          dataNormalizada
        );
      }
    }

    if (row.ut) {
      uts.add(
        String(row.ut).trim()
      );
    }

    if (row.equipe) {
      equipes.add(
        String(row.equipe).trim()
      );
    }
  });

  // ==========================================
  // MÉDIA POR EQUIPE
  // ==========================================

  const mediaEquipe =
    dias.size > 0 &&
    equipes.size > 0
      ? volumeComercial /
        dias.size /
        equipes.size
      : 0;

  // ==========================================
  // CONFERÊNCIA
  // ==========================================

  console.log(
    "================================="
  );

  console.log(
    "STATS MEDIÇÃO"
  );

  console.log(
    "Volume Florestal M³:",
    volumeFlorestal
  );

  console.log(
    "Volume Comercial M³:",
    volumeComercial
  );

  console.log(
    "Árvores:",
    arvores
  );

  console.log(
    "Espécies:",
    especies.size
  );

  console.log(
    "Dias:",
    dias.size
  );

  console.log(
    "UTs:",
    uts.size
  );

  console.log(
    "Equipes:",
    equipes.size
  );

  console.log(
    "Média por Equipe M³:",
    mediaEquipe
  );

  console.log(
    "Datas encontradas:",
    [...dias]
  );

  console.log(
    "================================="
  );

  return {
    volumeFlorestal,

    volumeComercial,

    arvores,

    especies:
      especies.size,

    dias:
      dias.size,

    uts:
      uts.size,

    mediaEquipe,
  };
}