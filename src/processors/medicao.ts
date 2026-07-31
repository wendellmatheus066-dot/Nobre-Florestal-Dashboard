export interface MedicaoStats {
  volumeFlorestal: number;
  volumeComercial: number;
  arvores: number;
  especies: number;
  dias: number;
  uts: number;
  mediaEquipe: number;
}

export function processarMedicao(medicao: any[]) {

  console.log("Primeira linha da medição:", medicao[0]);

  return medicao.map((row) => {

    const volumeFlorestal = Number(
      String(row["Florestal M3"] ?? 0)
        .replace(",", ".")
    );

    const volumeComercial = Number(
      String(row["Comercial M3"] ?? 0)
        .replace(",", ".")
    );

    const arvores = Number(
      row["qtd a"] ?? 0
    );

    return {

      especie:
        row["Espécie"] ??
        row["ESPÉCIE"] ??
        "",

      volumeFlorestal,

      volumeComercial,

      arvores,

      data:
        row["Data"] ??
        "",

      ut:
        row["UT Inventário"] ??
        "",

      equipe:
        row["Equipe"] ??
        "",

    };

  });

}

export function calcularStatsMedicao(
  registros: any[]
): MedicaoStats {

  let volumeFlorestal = 0;

  let volumeComercial = 0;

  let arvores = 0;

  const especies = new Set<string>();

  const dias = new Set<string>();

  const uts = new Set<string>();

  const equipes = new Set<string>();

  registros.forEach((row) => {

    volumeFlorestal += row.volumeFlorestal;

    volumeComercial += row.volumeComercial;

    arvores += row.arvores;

    if (row.especie) {
      especies.add(row.especie);
    }

    if (row.data) {
      dias.add(row.data);
    }

    if (row.ut) {
      uts.add(row.ut);
    }

    if (row.equipe) {
      equipes.add(row.equipe);
    }

  });

  return {

    volumeFlorestal,

    volumeComercial,

    arvores,

    especies: especies.size,

    dias: dias.size,

    uts: uts.size,

    mediaEquipe:
      dias.size > 0 && equipes.size > 0
        ? volumeComercial /
          dias.size /
          equipes.size
        : 0,

  };

}