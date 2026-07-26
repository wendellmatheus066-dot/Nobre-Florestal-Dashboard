export interface MedicaoStats {
  volumeComercial: number;
  arvores: number;
  especies: number;
  dias: number;
  uts: number;
  mediaArvore: number;
}

export function processarMedicao(medicao: any[]) {
  console.log(medicao[0]);
  return medicao.map((row) => ({
    especie:
      row["Espécie"] ??
      row["ESPÉCIE"] ??
      row["especie"] ??
      "",

    volumeComercial: Number(
      row["Comercial M3"] ??
      row["COMERCIAL M3"] ??
      row["volumeComercial"] ??
      0
    ),

    arvores: Number(
      row["qtd a"] ??
      row["QTD A"] ??
      row["arvores"] ??
      0
    ),

    data:
      row["Data"] ??
      row["DATA"] ??
      "",

    ut:
      row["UT Inventário"] ??
      row["UT"] ??
      "",
  }));
}

export function calcularStatsMedicao(registros: any[]): MedicaoStats {
  let volumeComercial = 0;
  let arvores = 0;

  const especies = new Set<string>();
  const dias = new Set<string>();
  const uts = new Set<string>();

  registros.forEach((row) => {
    volumeComercial += Number(row.volumeComercial ?? 0);
    arvores += Number(row.arvores ?? 0);

    if (row.especie) especies.add(row.especie);

    if (row.data) dias.add(row.data);

    if (row.ut) uts.add(row.ut);
  });

  return {
    volumeComercial,
    arvores,
    especies: especies.size,
    dias: dias.size,
    uts: uts.size,
    mediaArvore:
      arvores > 0
        ? volumeComercial / arvores
        : 0,
  };
}